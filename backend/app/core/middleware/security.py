# 역할: 모든 응답에 기본 보안 헤더를 붙이는 미들웨어

from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware


class Security(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        h = response.headers
        h["X-Content-Type-Options"] = "nosniff"
        # 관리자 화면을 다른 사이트의 iframe 에 못 넣게 한다
        h["X-Frame-Options"] = "DENY"
        h["X-XSS-Protection"] = "1; mode=block"
        # 운영은 HTTPS 만 쓴다. 한 번 접속한 브라우저는 1년간 http 로 오지 않는다
        h["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


def setup_security(app: FastAPI):
    app.add_middleware(Security)
