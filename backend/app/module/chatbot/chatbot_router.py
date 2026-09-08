# 역할: 챗봇 공개 API(설정 조회 · 답변 · SSE 스트리밍)와 관리자 API(설정 · 기록 · 통계)

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.provider.http.endpoint import with_provider
from app.core.provider.http.login import with_login
from app.core.provider.http.service import ServiceProvider
from app.core.utils.response import success

router = APIRouter()


@router.get("/config")
@with_provider
async def get_chatbot_config(p: ServiceProvider):
    """공개 — 위젯이 쓰는 값만 (enabled, greeting). 지침은 내려주지 않는다"""
    return success(await p.chatbot_service.get_public_config())


@router.get("/setting")
@with_provider
@with_login("admin")
async def get_chatbot_setting(p: ServiceProvider):
    """관리자 — 모델 · 지침 · 인사말 · 사용 여부"""
    return success(await p.chatbot_service.get_setting())


@router.post("/setting")
@with_provider
@with_login("admin")
async def update_chatbot_setting(p: ServiceProvider):
    return success(await p.chatbot_service.update_setting(p.request))


@router.post("/message")
@with_provider
async def send_chatbot_message(p: ServiceProvider):
    """공개 — 방문자 질문에 답한다. 지침·포트폴리오 컨텍스트는 서버에서 붙는다"""
    return success(await p.chatbot_service.answer(p.request))


@router.post("/message/stream")
@with_provider
async def stream_chatbot_message(p: ServiceProvider):
    """공개 — 같은 답을 조각으로 흘린다(SSE). 위젯이 타이핑처럼 그린다.

    검증 · 호출 제한은 answer_stream 안에서 스트림 시작 전에 끝난다. 그래서
    잘못된 요청은 여느 엔드포인트처럼 JSON 오류로 떨어진다. 흐르기 시작한
    뒤의 실패는 상태 코드를 바꿀 수 없어 이벤트로 알린다.
    """
    deltas = await p.chatbot_service.answer_stream(p.request)

    async def events():
        try:
            async for delta in deltas:
                yield f"data: {json.dumps({'text': delta}, ensure_ascii=False)}\n\n"
        except Exception as error:
            message = getattr(error, "detail", None) or "답변 생성에 실패했습니다."
            yield f"data: {json.dumps({'error': str(message)}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        # nginx 가 버퍼링하면 조각이 한꺼번에 도착해 타이핑이 안 보인다
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/log")
@with_provider
@with_login("admin")
async def list_chatbot_logs(p: ServiceProvider):
    """관리자 — 대화 목록. ?page=1&size=20"""
    return success(await p.chatbot_service.list_logs(p.request))


@router.get("/log/detail")
@with_provider
@with_login("admin")
async def get_chatbot_log(p: ServiceProvider):
    """관리자 — 그 대화의 질문·답변 전문. ?session_id=1

    path 파라미터를 쓰지 않는다 — `with_provider` 가 p 하나만 넘기는 구조라
    경로 변수가 함수까지 도달하지 않는다(기존 라우터들도 같은 이유로 쿼리·body 를 쓴다).
    """
    return success(await p.chatbot_service.get_log(p.request))


@router.get("/stats")
@with_provider
@with_login("admin")
async def get_chatbot_stats(p: ServiceProvider):
    """관리자 — 대시보드용 집계. ?from=&to=&unit=day|week|month"""
    return success(await p.chatbot_service.get_stats(p.request))
