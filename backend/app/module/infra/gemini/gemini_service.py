# 역할: Gemini REST API 호출 래퍼 — 단발 생성 · SSE 스트리밍 · 토큰 사용량 집계
"""Gemini(Generative Language API) 호출 래퍼.

SDK(google-genai) 를 쓰지 않고 REST 를 직접 호출한다. 필요한 건 텍스트 한 번
주고받는 것뿐이고, 이미 있는 httpx 로 충분해서 의존성을 늘리지 않았다.
"""

import json
from typing import AsyncIterator

import httpx

from app.core.config.settings import settings
from app.core.utils.response import fail

API_BASE = "https://generativelanguage.googleapis.com/v1beta"

# 답변 길이 상한. 챗봇 풍선에 들어갈 분량이면 충분하고,
# 무료 티어의 분당 토큰 한도도 이쪽이 안전하다.
MAX_OUTPUT_TOKENS = 800
TIMEOUT_SECONDS = 30.0


class GeminiService:
    """DB 를 모른다. 프롬프트를 받아 문자열 답변을 돌려주는 것만 한다."""

    def __init__(self):
        self.api_key = settings.gemini_api_key

    @property
    def available(self) -> bool:
        """키가 없으면 앱은 뜨지만 챗봇만 못 쓴다"""
        return bool(self.api_key)

    async def generate(
        self,
        model: str,
        instruction: str,
        contents: list[dict],
        tools: list[dict] | None = None,
        usage: dict | None = None,
    ) -> dict:
        """모델이 돌려준 content 를 그대로 반환한다.

        contents 는 [{"role": "user"|"model", "parts": [{"text": ...}]}] 형태.
        tools 를 주면 응답 parts 에 text 대신 functionCall 이 올 수 있다 —
        무엇을 호출할지는 모델이 정하고, 실행과 반복은 호출부가 맡는다.
        """
        if not self.available:
            fail("챗봇이 아직 설정되지 않았습니다.", status_code=503)

        payload = self._payload(instruction, contents, tools)
        url = f"{API_BASE}/models/{model}:generateContent"
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
                response = await client.post(
                    url,
                    headers={"x-goog-api-key": self.api_key},
                    json=payload,
                )
        except httpx.HTTPError:
            fail("답변 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.", status_code=502)

        self._raise_for_status(response)
        data = response.json()
        self._add_usage(usage, data.get("usageMetadata"))
        return self._extract_content(data)

    # ── 요청 조립 · 오류 판정 (generate / stream 공용) ───────

    @staticmethod
    def _payload(instruction: str, contents: list[dict], tools: list[dict] | None) -> dict:
        payload: dict = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": MAX_OUTPUT_TOKENS,
            },
        }
        if instruction:
            payload["systemInstruction"] = {"parts": [{"text": instruction}]}
        if tools:
            payload["tools"] = [{"functionDeclarations": tools}]
        return payload

    @classmethod
    def _raise_for_status(cls, response: httpx.Response) -> None:
        if response.status_code == 429:
            # 무료 티어 한도 소진. 방문자에게는 그대로 알려주는 편이 낫다
            fail("오늘 사용 가능한 답변 수를 모두 썼습니다. 잠시 후 다시 시도해 주세요.", status_code=429)
        if response.status_code >= 400:
            fail(
                f"답변 생성에 실패했습니다. (Gemini {response.status_code}) {cls._error_message(response)}",
                status_code=502,
            )

    async def stream(
        self,
        model: str,
        instruction: str,
        contents: list[dict],
        tools: list[dict] | None = None,
        usage: dict | None = None,
    ) -> AsyncIterator[dict]:
        """SSE 로 받아 텍스트 조각을 흘리고, 끝에 모델 content 전체를 한 번 더 준다.

        흘리는 것: {"type": "text", "text": "..."} — 도착한 순서대로
        마지막 하나: {"type": "content", "content": {...}} — functionCall 판정과
        다음 라운드에 그대로 되돌려 보낼 용도. 조각을 이어붙인 텍스트도 여기 들어 있다.
        """
        if not self.available:
            fail("챗봇이 아직 설정되지 않았습니다.", status_code=503)

        payload = self._payload(instruction, contents, tools)
        url = f"{API_BASE}/models/{model}:streamGenerateContent?alt=sse"

        other_parts: list[dict] = []
        texts: list[str] = []
        # 조각마다 오는 usageMetadata 는 누적값이라 더하면 중복된다. 마지막 것만 쓴다
        last_meta: dict | None = None
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
                async with client.stream(
                    "POST", url, headers={"x-goog-api-key": self.api_key}, json=payload
                ) as response:
                    if response.status_code >= 400:
                        # 스트림이라 본문을 먼저 읽어야 사유를 볼 수 있다
                        await response.aread()
                        self._raise_for_status(response)

                    async for line in response.aiter_lines():
                        if not line.startswith("data:"):
                            continue
                        chunk = line[len("data:") :].strip()
                        if not chunk or chunk == "[DONE]":
                            continue
                        data = self._json(chunk)
                        if data is None:
                            continue
                        if data.get("usageMetadata"):
                            last_meta = data["usageMetadata"]
                        for part in self._parts_of(data):
                            if "text" in part:
                                texts.append(part["text"])
                                yield {"type": "text", "text": part["text"]}
                            else:
                                # functionCall 등. thoughtSignature 가 붙어 있으므로
                                # 쪼개지 않고 통째로 보관해 다음 라운드에 되돌려준다
                                other_parts.append(part)
        except httpx.HTTPError:
            fail("답변 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.", status_code=502)

        self._add_usage(usage, last_meta)

        parts = other_parts + ([{"text": "".join(texts)}] if texts else [])
        if not parts:
            fail("답변을 만들지 못했습니다. 질문을 조금 바꿔서 다시 물어봐 주세요.", status_code=502)
        yield {"type": "content", "content": {"role": "model", "parts": parts}}

    @staticmethod
    def _json(chunk: str) -> dict | None:
        try:
            return json.loads(chunk)
        except json.JSONDecodeError:
            return None

    @staticmethod
    def _add_usage(usage: dict | None, meta: dict | None) -> None:
        """토큰 사용량을 누적한다.

        tool 을 부르면 한 질문에 Gemini 호출이 여러 번이라, 호출마다 합산해야
        그 질문이 실제로 쓴 양이 된다.
        """
        if usage is None or not meta:
            return
        for key, field in (
            ("prompt_tokens", "promptTokenCount"),
            ("output_tokens", "candidatesTokenCount"),
        ):
            value = meta.get(field)
            if isinstance(value, int):
                usage[key] = usage.get(key, 0) + value

    @staticmethod
    def _parts_of(data: dict) -> list[dict]:
        candidates = data.get("candidates") or []
        if not candidates:
            return []
        return [
            part
            for part in (candidates[0].get("content") or {}).get("parts", [])
            if isinstance(part, dict)
        ]

    # ── 응답 읽기 ───────────────────────────────────────────

    @staticmethod
    def _extract_content(data: dict) -> dict:
        """candidates[0].content 를 꺼낸다. 정상 응답이어도 비어 올 수 있다"""
        candidates = data.get("candidates") or []
        if not candidates:
            fail("답변을 만들지 못했습니다. 질문을 조금 바꿔서 다시 물어봐 주세요.", status_code=502)

        candidate = candidates[0]
        content = candidate.get("content") or {}
        if not content.get("parts"):
            # 안전필터에 걸리거나 토큰이 모자라면 parts 가 비어 온다
            if candidate.get("finishReason") == "MAX_TOKENS":
                fail("답변이 너무 길어 생성에 실패했습니다. 질문을 좁혀서 다시 물어봐 주세요.", status_code=502)
            fail("답변을 만들지 못했습니다. 질문을 조금 바꿔서 다시 물어봐 주세요.", status_code=502)
        return content

    @staticmethod
    def function_calls(content: dict) -> list[dict]:
        """모델이 호출하려는 함수들. 없으면 빈 목록"""
        return [
            part["functionCall"]
            for part in content.get("parts", [])
            if isinstance(part, dict) and "functionCall" in part
        ]

    @staticmethod
    def text_of(content: dict) -> str:
        text = "".join(
            part.get("text", "")
            for part in content.get("parts", [])
            if isinstance(part, dict)
        ).strip()
        if not text:
            fail("답변을 만들지 못했습니다. 질문을 조금 바꿔서 다시 물어봐 주세요.", status_code=502)
        return text

    # ── 내부 헬퍼 ───────────────────────────────────────────

    @staticmethod
    def _error_message(response: httpx.Response) -> str:
        try:
            return str(response.json().get("error", {}).get("message", ""))[:200]
        except Exception:
            return ""
