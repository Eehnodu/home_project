# 역할: 요청마다 UUID 를 만들어 로그 컨텍스트와 응답 헤더(x-request-id)에 싣는 ASGI 미들웨어

import uuid
from fastapi import FastAPI

from app.core.logging.context import set_request_id, get_request_id


# BaseHTTPMiddleware 를 쓰지 않고 순수 ASGI 로 짠다 — WebSocket 연결에도 같은 ID 를 달아야 한다
class RequestIdMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            set_request_id(str(uuid.uuid4()))

        if scope["type"] == "http":
            # 응답 헤더에도 실어 두면 브라우저에서 본 오류를 서버 로그 한 줄과 바로 짝지을 수 있다
            async def send_with_header(message):
                if message["type"] == "http.response.start":
                    headers = list(message.get("headers", []))
                    headers.append((b"x-request-id", get_request_id().encode()))
                    message = {**message, "headers": headers}
                await send(message)

            await self.app(scope, receive, send_with_header)
        else:
            await self.app(scope, receive, send)


def setup_request_id(app: FastAPI):
    app.add_middleware(RequestIdMiddleware)
