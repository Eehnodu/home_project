# 역할: 챗봇 비즈니스 로직 — 프롬프트 조립 · Gemini function calling 왕복 · 스트리밍 · 호출 제한 · 기록 · 통계 집계

import logging
import re
import uuid
from datetime import date, datetime, time, timedelta
from time import perf_counter
from typing import Any

from fastapi import Request

from app.core.database.base import SessionLocal, now_kst
from app.core.utils.response import fail
from app.module.chatbot.chatbot import ChatbotSetting
from app.module.chatbot.chatbot_repository import ChatbotRepository
from app.module.infra.gemini.gemini_service import GeminiService
from app.module.infra.redis.redis_service import RedisService
from app.module.portfolio.portfolio_repository import PortfolioRepository

logger = logging.getLogger(__name__)

# 사용하는 모델. 무료 티어 한도(15 RPM · 500 RPD)를 보고 고정했다.
# 바꾸려면 여기만 고친다 — 관리자 화면은 이 값을 표시만 한다.
MODEL = "gemini-3.1-flash-lite"

# 관리자가 아직 아무것도 저장하지 않았을 때 쓰는 기본값
DEFAULT_INSTRUCTION = (
    "너는 개발자 Nodu 의 포트폴리오 사이트에 있는 안내 챗봇이다.\n"
    "방문자가 프로젝트, 기술 스택, 개발 방식에 대해 물으면 포트폴리오 내용을 근거로 "
    "한국어로 짧고 정확하게 답한다. 모르는 것은 모른다고 말하고 지어내지 않는다."
)
DEFAULT_GREETING = "안녕하세요. 궁금한 점을 편하게 물어보세요."

# 관리자 지침과 별개로 항상 붙는 출력 규칙.
# 위젯 풍선은 평문이라 마크다운을 그대로 쓰면 `**`, `*` 가 글자로 보인다.
FORMAT_RULE = (
    "답변 형식:\n"
    "- 마크다운을 쓰지 않는다. **굵게**, * 목록, # 제목, 표를 쓰지 않는다.\n"
    "- 목록이 필요하면 줄바꿈으로 나누고 앞에 · 를 붙인다.\n"
    "- 채팅 풍선에 들어갈 분량으로 답한다. 길어야 5~6줄이다.\n"
    "- 내부 처리 과정을 답에 쓰지 않는다. 함수 이름(search_projects 등), 도구,\n"
    "  검색, 컨텍스트, 목록이 잘렸다는 사정은 방문자가 알 필요가 없다.\n"
    "- 열거할 때는 세어 답한 개수와 실제로 적은 항목 수를 맞춘다. 다 적기 어려우면\n"
    "  개수만 말하고 대표 몇 개를 '예를 들면' 으로 붙인다."
)

# 언제 함수를 불러야 하는지. 부르지 않고 답하면 개수가 틀린다.
TOOL_RULE = (
    "함수 사용:\n"
    "- 특정 기술 · 키워드로 프로젝트를 세거나 골라야 하면 반드시 search_projects 를\n"
    "  먼저 호출한다. 주어진 목록을 눈으로 세어 답하지 않는다. 목록에는 각 프로젝트가\n"
    "  무슨 기술을 썼는지 적혀 있지 않으므로 세는 것 자체가 불가능하다.\n"
    "- 개수는 search_projects 가 돌려준 matched 값만 근거로 쓴다.\n"
    "- 어떤 프로젝트의 역할 · 상세 · 포인트가 필요한데 아래 컨텍스트에 없으면\n"
    "  get_project_detail 을 이름으로 호출한다."
)

INSTRUCTION_MAX = 8000
GREETING_MAX = 300

# 방문자 질문 길이 · 함께 보내는 이전 대화 수
MESSAGE_MAX = 1000

# 질문·답변 12쌍. 대화가 이어지는 동안 앞 얘기를 잊지 않게 넉넉히 둔다.
# 상한을 없애지는 않는다 — 답변 하나가 300~800자라 대화가 길어지면 이전 대화가
# 컨텍스트(4,000~7,000자)보다 커지고, 그때부터 모델이 방금 붙인 데이터보다
# 예전 턴의 옛 데이터를 근거로 답한다. 컨텍스트는 매 질문마다 달라진다.
HISTORY_MAX = 24

# 호출 제한. 공개 엔드포인트라 서버 쪽에서도 막는다.
# 무료 티어(15 RPM · 500 RPD)를 IP 하나가 다 써버리지 못하게 하는 것이 목적이다.
PER_MINUTE_LIMIT = 6
PER_DAY_LIMIT = 40
GLOBAL_DAY_LIMIT = 400

# 프로젝트 상세는 길어서 컨텍스트에 넣을 때 자른다
PROJECT_DESCRIPTION_MAX = 800

# 상세를 붙일 프로젝트 수. 질문에 걸린 것 / 아무것도 안 걸렸을 때(최근 것)
DETAIL_LIMIT = 5
FALLBACK_DETAIL_LIMIT = 3

# 대시보드 그래프가 보여주는 날짜 수
DASHBOARD_DAYS = 14

# 모델이 tool 을 부를 수 있는 왕복 횟수. 무료 티어라 한 질문이 호출을 많이 먹으면 안 된다
MAX_TOOL_ROUNDS = 3

# 스트리밍에서 잠시 붙잡아 두는 꼬리 문자. 마크다운 표시가 조각 경계에 걸려
# 화면에 나타났다 사라지는 것을 막는다(`**굵게**` 의 앞쪽 `**` 만 먼저 도착한다).
# 이 글자로 끝날 때만 잡아두고, 그 밖에는 도착한 즉시 내보낸다.
STREAM_HOLD_CHARS = "*`#-_"

# 모델이 부를 수 있는 함수. 미리 넣어준 상세가 잘렸거나 못 맞혔을 때 직접 가져가는 통로다.
# 설명은 영어로 쓴다 — 같은 모델이 한국어 설명보다 영어 설명에서 인자를 덜 틀린다.
TOOLS = [
    {
        "name": "search_projects",
        "description": (
            "Search the portfolio projects by technology, keyword, category or client type. "
            "Returns ALL matching projects as one-line summaries plus the exact match count, "
            "so use this for any 'how many' or 'list them all' question, and whenever the "
            "detail given in the system context was cut off and you need the rest."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "A single technology or keyword as written in the portfolio, "
                        "e.g. 'Redis', 'FastAPI', 'ERP', 'SI'. Not a full sentence."
                    ),
                }
            },
            "required": ["query"],
        },
    },
    {
        "name": "get_project_detail",
        "description": (
            "Get the full detail of ONE project by name — role, team, description, "
            "key points, features, problems and fixes, tech stack, integrations, link. Use it after search_projects, "
            "or when the visitor asks about a project whose detail is not in the context."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Project name as listed in the portfolio, e.g. '지스탁' or 'G-Stock'.",
                }
            },
            "required": ["name"],
        },
    },
]


def _point_text(item) -> str:
    """핵심 · 기능 · 문제와 개선 항목을 한 줄 텍스트로. {title, body} 와 예전 문자열 형식을 모두 받는다"""
    if isinstance(item, dict):
        title = str(item.get("title") or "").strip()
        body = str(item.get("body") or "").strip()
        return f"{title} — {body}" if title and body else (title or body)
    return str(item or "")


class ChatbotService:
    def __init__(
        self,
        chatbot_repo: ChatbotRepository,
        portfolio_repo: PortfolioRepository,
        gemini_service: GeminiService,
        redis_service: RedisService,
    ):
        self.chatbot_repo = chatbot_repo
        # 답변 근거는 포트폴리오 DB 다. 별도 지식 저장소를 두지 않는다
        self.portfolio_repo = portfolio_repo
        self.gemini_service = gemini_service
        self.redis_service = redis_service

    # ── 조회 ────────────────────────────────────────────────

    async def get_setting(self) -> dict:
        """관리자용 — 지침까지 전부"""
        setting = await self.chatbot_repo.get_setting()
        return self._to_dict(setting)

    async def get_public_config(self) -> dict:
        """공개 위젯용 — 지침은 내려주지 않는다. 시스템 프롬프트는 서버에만 있어야 한다."""
        setting = await self.chatbot_repo.get_setting()
        data = self._to_dict(setting)
        return {"enabled": data["enabled"], "greeting": data["greeting"]}

    # ── 수정 ────────────────────────────────────────────────

    async def update_setting(self, request: Request) -> dict:
        body = await self._read_json(request)

        enabled = body.get("enabled", True)
        if not isinstance(enabled, bool):
            fail("enabled 는 true / false 여야 합니다.")

        fields = {
            "enabled": enabled,
            "instruction": self._text(body, "instruction", INSTRUCTION_MAX),
            "greeting": self._text(body, "greeting", GREETING_MAX),
        }
        setting = await self.chatbot_repo.upsert_setting(fields)
        return self._to_dict(setting)

    # ── 답변 ────────────────────────────────────────────────

    async def answer(self, request: Request) -> dict:
        """공개 — 방문자 질문에 답한다.

        지침(시스템 프롬프트)과 포트폴리오 데이터는 서버에서 붙인다.
        클라이언트가 보내는 것은 질문과 이전 대화뿐이다.
        """
        # 요청이 들어온 시점부터 잰다 — 앞 구간(설정 조회 · 호출 제한 · 컨텍스트
        # 조립)이 빠지면 기록된 시간이 실제와 크게 어긋난다
        started = perf_counter()

        setting = await self.chatbot_repo.get_setting()
        data = self._to_dict(setting)
        if not data["enabled"]:
            fail("챗봇이 현재 꺼져 있습니다.", status_code=503)

        body = await self._read_json(request)
        message = self._text(body, "message", MESSAGE_MAX)
        if not message:
            fail("질문을 입력해 주세요.")
        history = self._history(body.get("history"))

        await self._check_rate_limit(request)

        instruction = "\n\n".join(
            [
                data["instruction"] or DEFAULT_INSTRUCTION,
                FORMAT_RULE,
                TOOL_RULE,
                await self._context(message, history),
            ]
        )
        contents = history + [{"role": "user", "parts": [{"text": message}]}]
        projects = await self.portfolio_repo.list_projects(visible_only=True)

        keys = self._keys(request, body)
        tools_used: list[dict] = []
        usage: dict = {}
        try:
            reply = self._plain_text(
                await self._generate(instruction, contents, projects, tools_used, usage)
            )
        except Exception as error:
            await self._record(keys, message, "", tools_used, usage, started, error)
            raise
        await self._record(keys, message, reply, tools_used, usage, started)
        return {"reply": reply}

    async def answer_stream(self, request: Request):
        """공개 — 답을 조각으로 흘린다. 위젯이 타이핑처럼 그린다.

        검증 · 호출 제한 · DB 읽기를 **여기서 먼저** 끝내고 생성기를 돌려준다.
        스트림이 흐르는 동안에는 요청에 딸린 DB 세션이 살아 있다고 보장할 수
        없고, 한 번 흘러나간 응답은 상태 코드를 되돌릴 수도 없다.
        """
        # 요청이 들어온 시점부터 잰다. 스트림이 시작된 뒤부터 재면 그 전 구간
        # (설정 조회 · 호출 제한 · 컨텍스트 조립)이 기록에서 빠져, 실제로 30초
        # 걸린 요청이 2.5초로 남는다.
        started = perf_counter()

        setting = await self.chatbot_repo.get_setting()
        data = self._to_dict(setting)
        if not data["enabled"]:
            fail("챗봇이 현재 꺼져 있습니다.", status_code=503)

        body = await self._read_json(request)
        message = self._text(body, "message", MESSAGE_MAX)
        if not message:
            fail("질문을 입력해 주세요.")
        history = self._history(body.get("history"))

        await self._check_rate_limit(request)

        instruction = "\n\n".join(
            [
                data["instruction"] or DEFAULT_INSTRUCTION,
                FORMAT_RULE,
                TOOL_RULE,
                await self._context(message, history),
            ]
        )
        contents = history + [{"role": "user", "parts": [{"text": message}]}]
        projects = await self.portfolio_repo.list_projects(visible_only=True)
        keys = self._keys(request, body)

        async def run():
            """흘리면서 모아뒀다가 끝에 한 번 기록한다. 조각마다 쓰면 DB 만 두드린다"""
            tools_used: list[dict] = []
            usage: dict = {}
            answered: list[str] = []
            try:
                async for delta in self._generate_stream(
                    instruction, contents, projects, tools_used, usage
                ):
                    answered.append(delta)
                    yield delta
            except Exception as error:
                # 실패한 질문도 남긴다 — 무엇을 못 답했는지가 제일 값지다
                await self._record(
                    keys, message, "".join(answered), tools_used, usage, started, error
                )
                raise
            await self._record(
                keys, message, "".join(answered), tools_used, usage, started
            )

        return run()

    # ── 대화 기록 ───────────────────────────────────────────

    def _keys(self, request: Request, body: dict) -> dict:
        """누가 물었는지 식별할 값들. 로그인이 없어 세 층을 함께 쓴다.

        위젯이 준 키는 신뢰하지 않는다 — 길이를 자르고 허용 문자만 남긴다.
        아예 없으면(저장소 차단 · 스크립트 직접 호출) 서버가 하나 만들어 준다.
        그래야 그 요청도 기록에서 빠지지 않는다.
        """
        return {
            "session_key": self._key(body.get("session_key")),
            "visitor_key": self._key(body.get("visitor_key")) if body.get("visitor_key") else None,
            "ip": self._client_ip(request),
            "user_agent": (request.headers.get("user-agent") or "")[:500] or None,
            "referrer": (request.headers.get("referer") or "")[:500] or None,
        }

    @staticmethod
    def _key(raw: Any) -> str:
        if not isinstance(raw, str):
            return uuid.uuid4().hex
        cleaned = re.sub(r"[^0-9a-zA-Z-]", "", raw)[:64]
        return cleaned or uuid.uuid4().hex

    async def _record(
        self,
        keys: dict,
        question: str,
        answer: str,
        tools: list[dict],
        usage: dict,
        started: float,
        error: Exception | None = None,
    ) -> None:
        """기록은 요청에 딸린 DB 세션이 아니라 자기 세션으로 쓴다.

        스트리밍 응답은 엔드포인트가 반환된 뒤에 흐르고, 그때 요청 세션은 이미
        닫혀 있을 수 있다. 기록이 실패해도 답변은 이미 방문자에게 갔으므로
        예외를 올리지 않고 로그만 남긴다 — 기록 때문에 답변이 깨지면 안 된다.
        """
        message = getattr(error, "detail", None) or (str(error) if error else None)
        fields = {
            "question": question,
            "answer": answer or None,
            "tools": tools or None,
            # 무료 티어라 비용이 들지는 않지만, 어떤 질문이 컨텍스트를 많이 먹는지
            # 보이면 컨텍스트를 줄일 근거가 된다
            "prompt_tokens": usage.get("prompt_tokens"),
            "output_tokens": usage.get("output_tokens"),
            "latency_ms": int((perf_counter() - started) * 1000),
            "error": str(message)[:500] if message else None,
        }
        try:
            async with SessionLocal() as db:
                await ChatbotRepository(db).add_message(keys, fields)
        except Exception as failure:
            logger.warning(f"[chatbot] 대화 기록 실패: {failure}")

    # ── 관리자 — 기록 조회 ──────────────────────────────────

    async def list_logs(self, request: Request) -> dict:
        page = max(1, self._int(request.query_params.get("page"), 1))
        size = min(50, max(1, self._int(request.query_params.get("size"), 20)))

        sessions, total = await self.chatbot_repo.list_sessions(page, size)
        questions = await self.chatbot_repo.first_questions([one.id for one in sessions])
        return {
            "total": total,
            "page": page,
            "size": size,
            "items": [self._session_to_dict(one, questions.get(one.id, "")) for one in sessions],
        }

    async def get_log(self, request: Request) -> dict:
        session_id = self._int(request.query_params.get("session_id"), 0)
        session = await self.chatbot_repo.get_session(session_id)
        if session is None:
            fail("없는 대화입니다.", status_code=404)

        messages = await self.chatbot_repo.list_messages(session_id)
        return {
            "session": self._session_to_dict(session, ""),
            "messages": [
                {
                    "id": one.id,
                    "question": one.question,
                    "answer": one.answer or "",
                    "tools": one.tools or [],
                    "prompt_tokens": one.prompt_tokens,
                    "output_tokens": one.output_tokens,
                    "latency_ms": one.latency_ms,
                    "error": one.error,
                    "created_at": one.created_at.isoformat() if one.created_at else None,
                }
                for one in messages
            ],
        }

    # ── 관리자 — 대시보드 통계 ──────────────────────────────

    async def get_stats(self, request: Request) -> dict:
        """대시보드가 쓰는 값. `?from=YYYY-MM-DD&to=YYYY-MM-DD&unit=day|week|month`

        기간을 안 주면 최근 14일. 단위를 안 주면 일간.
        합계도 기간을 따른다 — 필터를 걸었는데 숫자가 전체 값이면 어긋나 보인다.
        """
        first, last, unit = self._range(request)
        # `to` 는 그 날짜를 포함해야 하므로 다음 날 0시 직전까지 센다
        start = datetime.combine(first, time.min)
        end = datetime.combine(last + timedelta(days=1), time.min)

        totals = await self.chatbot_repo.stats_totals(start, end)
        daily = await self.chatbot_repo.stats_daily(start, end)
        tools = await self.chatbot_repo.stats_tools(start, end)
        projects = await self.portfolio_repo.list_projects()

        return {
            "range": {"from": str(first), "to": str(last), "unit": unit},
            "totals": {
                **totals,
                "projects": len(projects),
                "hidden_projects": sum(1 for one in projects if not one.visible),
                "avg_prompt_tokens": (
                    round(totals["prompt_tokens"] / totals["messages"])
                    if totals["messages"]
                    else 0
                ),
            },
            "series": self._series(daily, first, last, unit),
            "tools": self._count_tools(tools),
            "categories": self._count_by(projects, "category"),
        }

    @classmethod
    def _range(cls, request: Request) -> tuple:
        """쿼리에서 기간과 단위를 읽는다. 잘못된 값은 기본값으로 되돌린다"""
        params = request.query_params
        unit = params.get("unit", "day")
        if unit not in ("day", "week", "month"):
            unit = "day"

        today = now_kst().date()
        last = cls._date(params.get("to")) or today
        first = cls._date(params.get("from")) or (last - timedelta(days=DASHBOARD_DAYS - 1))
        if first > last:
            first, last = last, first

        # 주간·월간은 칸 이름이 "그 주 월요일" · "그 달 1일" 이다. 시작을 그 경계로
        # 내리지 않으면 첫 칸이 라벨이 가리키는 기간의 일부만 담은 반쪽이 된다
        # (라벨은 "06-15 주" 인데 실제로는 6/17 부터만 담기는 식). 칸 수도 하나 늘어난다.
        if unit == "week":
            first -= timedelta(days=first.weekday())
        elif unit == "month":
            first = first.replace(day=1)

        return first, last, unit

    @staticmethod
    def _date(raw: Any):
        if not isinstance(raw, str):
            return None
        try:
            return date.fromisoformat(raw[:10])
        except ValueError:
            return None

    @classmethod
    def _series(cls, rows: list[tuple], first, last, unit: str) -> list[dict]:
        """하루 단위 결과를 단위별 칸에 담는다.

        데이터가 없는 칸도 0 으로 남긴다 — 빼면 그래프가 기간을 건너뛰어
        추이가 왜곡된다. 평균 응답 시간은 칸 안의 질문 수로 가중 평균한다.
        하루 평균을 그냥 더해 나누면 질문 1건인 날이 100건인 날과 같은 무게를 갖는다.
        """
        found = {
            str(day): (int(count), int(latency or 0))
            for day, count, latency in rows
        }

        buckets: dict[str, dict] = {}
        order: list[str] = []
        day = first
        while day <= last:
            key = cls._bucket(day, unit)
            if key not in buckets:
                buckets[key] = {"label": key, "questions": 0, "latency_sum": 0}
                order.append(key)
            count, latency = found.get(str(day), (0, 0))
            buckets[key]["questions"] += count
            buckets[key]["latency_sum"] += latency * count
            day += timedelta(days=1)

        return [
            {
                "label": key,
                "questions": buckets[key]["questions"],
                "avg_latency_ms": (
                    round(buckets[key]["latency_sum"] / buckets[key]["questions"])
                    if buckets[key]["questions"]
                    else 0
                ),
            }
            for key in order
        ]

    @staticmethod
    def _bucket(day, unit: str) -> str:
        """그 날짜가 들어갈 칸의 이름. 주간은 그 주 월요일, 월간은 그 달 1일"""
        if unit == "week":
            return str(day - timedelta(days=day.weekday()))
        if unit == "month":
            return str(day.replace(day=1))
        return str(day)

    @staticmethod
    def _count_tools(rows: list) -> list[dict]:
        """함수별 호출 횟수. 안 부른 질문도 '미사용' 으로 함께 센다 —
        전체 대비 얼마나 함수를 타는지가 궁금한 값이다"""
        counts: dict[str, int] = {}
        unused = 0
        for tools in rows:
            if not tools:
                unused += 1
                continue
            for tool in tools:
                name = str(tool.get("name", "?"))
                counts[name] = counts.get(name, 0) + 1
        ordered = sorted(counts.items(), key=lambda one: -one[1])
        result = [{"name": name, "count": count} for name, count in ordered]
        if unused:
            result.append({"name": "미사용", "count": unused})
        return result

    @staticmethod
    def _count_by(projects: list, field: str) -> list[dict]:
        counts: dict[str, int] = {}
        for project in projects:
            key = getattr(project, field) or "미분류"
            counts[key] = counts.get(key, 0) + 1
        return [
            {"name": name, "count": count}
            for name, count in sorted(counts.items(), key=lambda one: -one[1])
        ]

    @staticmethod
    def _session_to_dict(session, first_question: str) -> dict:
        return {
            "id": session.id,
            "session_key": session.session_key,
            "visitor_key": session.visitor_key,
            "ip": session.ip,
            "user_agent": session.user_agent,
            "referrer": session.referrer,
            "message_count": session.message_count or 0,
            "first_question": first_question,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "last_message_at": (
                session.last_message_at.isoformat() if session.last_message_at else None
            ),
        }

    @staticmethod
    def _int(raw: Any, default: int) -> int:
        try:
            return int(raw)
        except (TypeError, ValueError):
            return default

    async def _generate_stream(
        self,
        instruction: str,
        contents: list[dict],
        projects: list,
        tools_used: list[dict],
        usage: dict,
    ):
        """`_generate` 의 스트리밍 판. 텍스트 조각을 흘린다.

        마크다운 제거를 조각마다 그대로 적용할 수 없다 — `**굵게**` 의 앞쪽 `**`
        만 도착한 시점에는 지울 근거가 없어서 별표가 화면에 나타났다 사라진다.
        그래서 이어붙인 전체를 매번 정리하고, STREAM_HOLD_CHARS 로 끝나는 꼬리는
        붙잡아 둔 채 그 앞까지만 내보낸다. 남은 꼬리는 라운드가 끝날 때 흘린다.
        """
        for _ in range(MAX_TOOL_ROUNDS):
            texts: list[str] = []
            sent = 0
            content: dict = {}

            async for event in self.gemini_service.stream(
                MODEL, instruction, contents, TOOLS, usage
            ):
                if event["type"] == "content":
                    content = event["content"]
                    continue

                texts.append(event["text"])
                cleaned = self._plain_text("".join(texts))
                safe = self._safe_prefix(cleaned)
                if len(safe) > sent:
                    yield safe[sent:]
                    sent = len(safe)

            calls = self.gemini_service.function_calls(content)
            if not calls:
                cleaned = self._plain_text("".join(texts))
                if len(cleaned) > sent:
                    yield cleaned[sent:]
                return

            # tool 을 부르기 전에 뭔가 말했다면 그 몫도 남기지 않고 내보낸다
            cleaned = self._plain_text("".join(texts))
            if len(cleaned) > sent:
                yield cleaned[sent:]
            contents = contents + [content, self._tool_results(calls, projects, tools_used)]

        # 라운드를 다 썼다. tool 없이 한 번 더 물어 마무리한다
        content = await self.gemini_service.generate(MODEL, instruction, contents, None, usage)
        yield self._plain_text(self.gemini_service.text_of(content))

    @staticmethod
    def _safe_prefix(cleaned: str) -> str:
        """지금 당장 내보내도 되는 부분. 마크다운 기호로 끝나는 꼬리만 잡아둔다.

        `**굵게**` 는 앞쪽 `**` 가 먼저 도착한다. 그때 내보내면 별표가 화면에
        떴다가 뒤늦게 사라진다. 반대로 평범한 글자로 끝나면 지울 일이 없으니
        기다릴 이유도 없다 — 도착한 즉시 흘린다.
        """
        return cleaned.rstrip(STREAM_HOLD_CHARS)

    async def _generate(
        self,
        instruction: str,
        contents: list[dict],
        projects: list,
        tools_used: list[dict],
        usage: dict,
    ) -> str:
        """모델이 tool 을 부르면 실행해서 결과를 돌려주고 다시 묻는다.

        컨텍스트에 미리 넣어주는 상세는 잘려 있다. 그것만으로 부족할 때
        모델이 직접 더 가져가게 하는 것이 이 반복의 목적이다.
        왕복은 MAX_TOOL_ROUNDS 로 막는다 — 무료 티어에서 한 질문이 호출을
        무한히 먹으면 안 되고, 못 찾으면 모른다고 답하는 편이 맞다.
        """
        for _ in range(MAX_TOOL_ROUNDS):
            content = await self.gemini_service.generate(
                MODEL, instruction, contents, TOOLS, usage
            )
            calls = self.gemini_service.function_calls(content)
            if not calls:
                return self.gemini_service.text_of(content)

            contents = contents + [content, self._tool_results(calls, projects, tools_used)]

        # 여기까지 왔으면 tool 만 계속 부르고 있다. 마지막으로 tool 없이 물어 답을 받는다
        content = await self.gemini_service.generate(MODEL, instruction, contents, None, usage)
        return self.gemini_service.text_of(content)

    # ── tool 실행 ───────────────────────────────────────────

    def _tool_results(
        self, calls: list[dict], projects: list, tools_used: list[dict]
    ) -> dict:
        """모델이 부른 함수들을 실행해 functionResponse 로 묶는다.

        projects 는 미리 읽어둔 목록이다. DB 를 여기서 다시 치지 않는다 —
        스트리밍 응답은 엔드포인트가 반환된 뒤에 흐르고, 그때 요청에 딸린
        DB 세션이 살아 있다고 보장할 수 없다.
        """
        parts = []
        for call in calls:
            name = call.get("name", "")
            args = call.get("args") or {}
            result = self._run_tool(name, args, projects)
            # 무슨 함수가 어떤 인자로 걸렸는지 기록에 남긴다. "이 질문에 검색이
            # 걸렸나 · 어떤 검색어였나" 를 보면 컨텍스트를 고칠 근거가 된다
            tools_used.append(
                {"name": name, "args": args, "matched": result.get("matched")}
            )
            parts.append(
                {
                    "functionResponse": {
                        "name": name,
                        "response": result,
                    }
                }
            )
        return {"role": "user", "parts": parts}

    def _run_tool(self, name: str, args: dict, projects: list) -> dict:

        if name == "get_project_detail":
            wanted = str(args.get("name", "")).strip().lower()
            found = [
                project
                for project in projects
                if any(alias in wanted or wanted in alias for alias in self._aliases(project.name))
            ]
            if not found:
                # 이름을 잘못 부른 것이므로 있는 이름을 알려준다. 그러지 않으면 다시 틀린 이름으로 부른다
                return {
                    "found": False,
                    "available_names": [project.name for project in projects],
                }
            return {"found": True, "project": self._project_context(found[0])}

        if name == "search_projects":
            query = str(args.get("query", "")).strip().lower()
            if not query:
                return {"matched": 0, "projects": []}
            matches = self._matcher(query)
            found = [
                project for project in projects if matches(self._searchable(project))
            ]
            # 상세가 아니라 요약으로 전부 돌려준다. 몇 건이든 다 주므로 개수를 답해도 된다
            return {
                "matched": len(found),
                "total_projects": len(projects),
                "projects": [self._project_summary(project) for project in found],
                # 개수를 모델이 눈으로 세면 시스템 컨텍스트의 전체 목록까지 끌어와
                # 부풀린다 (실사례: 서버가 센 9건을 11건 · 14건이라고 답했다).
                # 그래서 matched 가 유일한 근거임을 못 박는다.
                "note": (
                    "matched 는 서버가 DB 에서 직접 센 정확한 개수다. 개수를 답할 때는 "
                    "matched 를 그대로 쓰고, projects 목록에 없는 프로젝트를 보태지 않는다. "
                    "이름을 열거할 때도 projects 안에서만 고른다. "
                    "상세가 필요하면 get_project_detail 을 이름으로 호출한다."
                ),
            }

        return {"error": f"알 수 없는 함수: {name}"}

    @staticmethod
    def _matcher(query: str):
        """검색어에 맞는 판정 함수를 만든다.

        영문·숫자는 낱말 경계로 본다 — 'SI' 를 부분 문자열로 찾으면 'session' 에
        걸려 20건이 나온다. 한글은 그대로 부분 문자열로 본다. 조사와 복합어 때문에
        경계를 걸면 '번역' 이 '번역기' 에서 안 걸린다.
        """
        if re.fullmatch(r"[0-9a-z .+#-]+", query):
            pattern = re.compile(rf"(?<![0-9a-z]){re.escape(query)}(?![0-9a-z])")
            return lambda text: bool(pattern.search(text))
        return lambda text: query in text

    @staticmethod
    def _searchable(project) -> str:
        """search_projects 가 훑는 텍스트 — 그 프로젝트의 모든 글.

        상세(description) 와 포인트(highlights)까지 넣는다. 좁게 잡으면 모델이
        세는 값과 어긋나고, 그러면 모델이 함수 결과를 무시한다 — '번역' 검색이
        소개만 훑어 3건을 돌려줬을 때 모델은 상세를 읽고 6건이라고 답했다.
        """
        chunks = [
            project.name or "",
            project.summary or "",
            project.description or "",
            project.kind or "",
            project.category or "",
            *(_point_text(item) for item in (project.highlights or [])),
            *(_point_text(item) for item in (project.features or [])),
            *(_point_text(item) for item in (project.improvements or [])),
            *(str(item) for item in (project.tech_stack or [])),
            *(str(item) for item in (project.tags or [])),
            *(str(item) for item in (project.integrations or [])),
        ]
        return " ".join(chunks).lower()

    @staticmethod
    def _plain_text(reply: str) -> str:
        """마크다운 표시를 걷어낸다.

        FORMAT_RULE 로 지시해도 모델은 자주 `**굵게**` 와 `* 목록` 을 쓴다.
        위젯 풍선은 평문이라 그대로 두면 기호가 글자로 보인다. 프롬프트는
        확률이고 이건 확실해야 해서 서버에서 정리한다.
        """
        text = re.sub(r"\*\*(.+?)\*\*", r"\1", reply)  # 굵게
        text = re.sub(r"`([^`]+)`", r"\1", text)  # 인라인 코드
        text = re.sub(r"^\s*#{1,6}\s*", "", text, flags=re.MULTILINE)  # 제목
        text = re.sub(r"^\s*[*-]\s+", "· ", text, flags=re.MULTILINE)  # 목록
        return text.strip()

    # ── 호출 제한 ───────────────────────────────────────────

    async def _check_rate_limit(self, request: Request) -> None:
        """IP 기준 분당 · 일당, 그리고 전체 일당을 함께 본다.

        Redis 가 죽어 있으면 통과시킨다 — 이 제한은 무료 티어 한도 보호용이고
        마지막 방어선은 Gemini 쪽 429 다. 챗봇 하나 때문에 500 을 내지 않는다.
        """
        ip = self._client_ip(request)
        stamp = now_kst()
        today = stamp.strftime("%Y%m%d")
        minute = stamp.strftime("%Y%m%d%H%M")

        checks = [
            (f"chatbot:rate:{ip}:{minute}", 70, PER_MINUTE_LIMIT),
            (f"chatbot:rate:{ip}:{today}", 60 * 60 * 25, PER_DAY_LIMIT),
            (f"chatbot:rate:all:{today}", 60 * 60 * 25, GLOBAL_DAY_LIMIT),
        ]
        try:
            counts = [
                (await self.redis_service.incr(key, expire), limit)
                for key, expire, limit in checks
            ]
        except Exception:
            return

        for count, limit in counts:
            if count > limit:
                fail("질문이 너무 많습니다. 잠시 후 다시 시도해 주세요.", status_code=429)

    @staticmethod
    def _client_ip(request: Request) -> str:
        """홈서버는 nginx 뒤에 있다. 프록시가 붙인 첫 홉을 쓴다"""
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    # ── 컨텍스트 ────────────────────────────────────────────

    async def _context(self, message: str, history: list[dict]) -> str:
        """포트폴리오 DB 를 프롬프트에 넣을 텍스트로 만든다.

        전부 붙이면 프로젝트가 늘어날수록 매 질문의 토큰이 같이 커진다. 그래서
        프로젝트는 **요약을 전부 + 상세는 질문에 걸린 것만** 넣는다. 개수·목록·
        기술 질문은 요약만으로 답할 수 있고, 특정 프로젝트를 물을 때만 상세가 필요하다.

        JSON 을 그대로 던지지 않는다 — 라벨이 붙은 평문이 답변에 인용되기 쉽고
        토큰도 덜 쓴다. 숨긴 프로젝트(visible=False)는 넣지 않는다.
        """
        info = await self.portfolio_repo.get_info()
        categories = await self.portfolio_repo.list_stack_categories()
        projects = await self.portfolio_repo.list_projects(visible_only=True)

        # 첫 줄이 중요하다. "여기에 없는 것은 모른다"고만 적었을 때 모델은 주어진
        # 것이 전부라고 읽고 함수를 아예 부르지 않았다 — 미리 준 상세 3건을 세어
        # "Redis 쓴 프로젝트는 3건" 이라고 답했다(실제 9건). 그래서 이게 일부이고
        # 나머지는 함수로 가져올 수 있다는 것을 먼저 못 박는다.
        lines: list[str] = [
            "아래는 포트폴리오의 일부다. 전체가 아니다.",
            "- 프로젝트 상세는 몇 건만 들어 있다. 나머지는 get_project_detail 로 가져온다.",
            "- 어느 프로젝트가 무슨 기술을 썼는지는 아래 목록에 없다. 기술 · 키워드로",
            "  세거나 골라야 하면 반드시 search_projects 를 호출한다.",
            "- 함수를 호출해도 못 찾은 것만 모른다고 답한다.",
        ]

        if info:
            lines.append("\n[프로필]")
            lines.append(f"이름: {info.name or ''} / {info.role_label or ''}")
            if info.headline:
                lines.append(f"한 줄 소개: {info.headline}")
            if info.description:
                lines.append(f"소개: {info.description}")
            if info.tags:
                lines.append(f"키워드: {', '.join(str(tag) for tag in info.tags)}")
            for career in info.careers or []:
                head = " · ".join(v for v in (career.get("org"), career.get("role"), career.get("period")) if v)
                items = " / ".join(str(item) for item in career.get("items") or [])
                lines.append(f"경력: {head}" + (f" — {items}" if items else ""))
            for edu in info.educations or []:
                lines.append("학력: " + " · ".join(v for v in (edu.get("school"), edu.get("major"), edu.get("period")) if v))
            for cert in info.certificates or []:
                lines.append("자격증: " + " · ".join(v for v in (cert.get("name"), cert.get("issuer"), cert.get("date")) if v))

        if categories:
            lines.append("\n[기술 스택]")
            for category in categories:
                names = [
                    str(item.get("name", ""))
                    for item in (category.items or [])
                    if isinstance(item, dict) and item.get("name")
                ]
                lines.append(f"- {category.name}: {', '.join(names)}")

        if projects:
            lines.append(f"\n[프로젝트 목록 — 전체 {len(projects)}건]")
            for project in projects:
                lines.append(self._project_summary(project))

            detail = self._pick_projects(projects, message, history)
            if detail:
                # 상세를 몇 건으로 자른 자리에는 반드시 '일부'라고 못 박는다.
                # 안 그러면 모델이 돌아온 개수를 정답 개수로 답한다 — 상세 5건일 때
                # "5개입니다", 3건일 때 "3개입니다" 가 된다.
                lines.append(
                    f"\n[아래 {len(detail)}건은 질문과 관련해 서버가 고른 일부다. "
                    f"전체는 위 목록 {len(projects)}건이며, 이 개수는 무엇의 개수도 아니다. "
                    "기술 · 키워드로 세거나 골라야 하면 search_projects 를 호출한다]"
                )
                for project in detail:
                    lines.append("\n" + self._project_context(project))

        return "\n".join(lines)

    # ── 질문에 걸리는 프로젝트 고르기 ────────────────────────

    @classmethod
    def _pick_projects(cls, projects: list, message: str, history: list[dict]) -> list:
        """질문에 이름이 나온 프로젝트의 상세를 미리 준다.

        형태소 분석을 하지 않는다. 찾을 이름 21개가 전부 DB 에 있어서, 질문
        문자열에 그 이름이 들어 있는지 보면 충분하다. 직전 질문까지 함께 보는
        이유는 "그 중 가장 최근 건은?" 같은 후속 질문에 이름이 없기 때문이다.

        기술로는 고르지 않는다. 예전에는 "Redis 쓴 프로젝트" 질문에 해당
        프로젝트 상세 5건을 미리 넣어줬는데, 모델이 그 잘린 5건을 답으로 여기고
        tool 을 아예 부르지 않았다(개수가 6 · 10 · 11건으로 흔들렸다).
        기술 · 키워드로 세고 고르는 일은 search_projects 가 DB 에서 하게 둔다.
        """
        haystack = cls._haystack(message, history)

        # 이름을 통째로 말하지 않는다("양천해누리복지관" 을 "복지관 프로젝트" 로
        # 묻는다). 그래서 이름이 질문에 있는지와, 질문의 낱말이 이름 안에 있는지를
        # 함께 본다. 낱말은 3자 이상만 쓴다 — 2자는 엉뚱한 이름에 걸린다.
        words = [word for word in re.findall(r"[0-9a-z가-힣]+", haystack) if len(word) >= 3]

        named = [
            project
            for project in projects
            if any(
                alias in haystack or any(word in alias for word in words)
                for alias in cls._aliases(project.name)
            )
        ]
        if named:
            return named[:DETAIL_LIMIT]

        # 이름이 안 나오면 최근 것들을 준다 — "가장 어려웠던 문제" 처럼
        # 이름도 없는 질문에 근거가 아예 없으면 답을 못 한다
        return projects[:FALLBACK_DETAIL_LIMIT]

    @staticmethod
    def _haystack(message: str, history: list[dict]) -> str:
        """질문 + 직전 사용자 발화를 소문자로 이어붙인다"""
        previous = [
            part.get("text", "")
            for item in history[-2:]
            if item.get("role") == "user"
            for part in item.get("parts", [])
        ]
        return " ".join([*previous, message]).lower()

    @staticmethod
    def _aliases(name: str | None) -> list[str]:
        """'지스탁 (G-Stock)' → ['지스탁', 'g-stock']

        DB 이름이 '한글 (영문)' 꼴이라 둘 중 어느 쪽으로 물어도 걸리게 한다.
        """
        if not name:
            return []
        lowered = name.lower()
        parts = [re.sub(r"\(.*?\)", "", lowered), *re.findall(r"\((.*?)\)", lowered)]
        return [part.strip() for part in parts if part.strip()]

    @staticmethod
    def _project_summary(project) -> str:
        """목록용 한 줄. 이름 · 구분 · 기간 · 소개.

        기술 목록은 일부러 넣지 않는다. 넣으면 "Redis 쓴 프로젝트 몇 개?" 같은
        질문에서 모델이 이 목록을 눈으로 세어 답하고, 그때마다 개수가 달라진다
        (실사례: 서버가 센 9건을 10 · 11 · 14건으로 답했다). 기술로 세는 일은
        search_projects 가 DB 에서 하고, 모델은 그 결과만 쓰게 한다.
        """
        head = f"- {project.name or ''} ({project.kind or ''} / {project.category or ''}"
        period = ChatbotService._period(project.start_date, project.end_date)
        head += f", {period})" if period else ")"
        if project.summary:
            head += f" {project.summary}"
        return head

    @staticmethod
    def _project_context(project) -> str:
        rows = [f"### {project.name or ''} ({project.kind or ''} / {project.category or ''})"]
        period = ChatbotService._period(project.start_date, project.end_date)
        if period:
            rows.append(f"기간: {period}")
        if project.status:
            rows.append(f"상태: {project.status}")
        if project.role:
            rows.append(f"역할: {project.role}")
        if project.team:
            rows.append(f"팀: {project.team}")
        if project.summary:
            rows.append(f"소개: {project.summary}")
        if project.description:
            rows.append(f"상세: {project.description[:PROJECT_DESCRIPTION_MAX]}")
        for label, items in (("핵심", project.highlights), ("기능", project.features), ("문제와 개선", project.improvements)):
            if items:
                rows.append(f"{label}: " + " / ".join(_point_text(item) for item in items))
        if project.tech_stack:
            rows.append("기술: " + ", ".join(str(item) for item in project.tech_stack))
        if project.integrations:
            rows.append("연동: " + ", ".join(str(item) for item in project.integrations))
        if project.url:
            rows.append(f"링크: {project.url}")
        return "\n".join(rows)

    @staticmethod
    def _period(start, end) -> str:
        if not start:
            return ""
        started = start.strftime("%Y.%m")
        if not end:
            return f"{started} ~ 진행 중"
        return f"{started} ~ {end.strftime('%Y.%m')}"

    @staticmethod
    def _history(raw: Any) -> list[dict]:
        """클라이언트가 보낸 이전 대화를 Gemini contents 형태로 바꾼다.

        신뢰할 수 없는 입력이라 역할 · 길이 · 개수를 모두 자른다.
        """
        if not isinstance(raw, list):
            return []

        contents: list[dict] = []
        for item in raw[-HISTORY_MAX:]:
            if not isinstance(item, dict):
                continue
            text = item.get("text")
            if not isinstance(text, str) or not text.strip():
                continue
            role = "user" if item.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": text.strip()[:MESSAGE_MAX]}]})

        # 대화는 user 로 시작해야 한다 — 앞의 model(인사말 등)은 버린다
        while contents and contents[0]["role"] == "model":
            contents.pop(0)
        return contents

    # ── 내부 헬퍼 ───────────────────────────────────────────

    @staticmethod
    def _to_dict(setting: ChatbotSetting | None) -> dict:
        if setting is None:
            return {
                "model": MODEL,
                "enabled": True,
                "instruction": DEFAULT_INSTRUCTION,
                "greeting": DEFAULT_GREETING,
            }
        return {
            "model": MODEL,
            "enabled": bool(setting.enabled),
            "instruction": setting.instruction or "",
            "greeting": setting.greeting or "",
        }

    @staticmethod
    async def _read_json(request: Request) -> dict:
        try:
            body = await request.json()
        except Exception:
            fail("요청 본문이 올바른 JSON 이 아닙니다.")
        if not isinstance(body, dict):
            fail("요청 본문이 올바른 JSON 이 아닙니다.")
        return body

    @staticmethod
    def _text(body: dict, key: str, max_length: int) -> str:
        value: Any = body.get(key, "")
        if value is None:
            value = ""
        if not isinstance(value, str):
            fail(f"{key} 는 문자열이어야 합니다.")
        value = value.strip()
        if len(value) > max_length:
            fail(f"{key} 는 {max_length}자를 넘을 수 없습니다.")
        return value
