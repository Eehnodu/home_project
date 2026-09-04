# 역할: 모든 예외를 BaseResponse 모양의 JSON 으로 통일하는 전역 예외 핸들러
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from app.core.utils.response import BaseResponse
from app.core.logging import get_logger
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = get_logger(__name__)


def setup_exceptions(app: FastAPI) -> None:
    """
    모든 예외 핸들러를 등록하는 함수
    """
    # fail() 이 던진 HTTPException 은 status · message · error_code 를 그대로 살려 내려준다.
    # Starlette 가 직접 내는 404 · 405 도 같은 모양으로 맞춘다
    @app.exception_handler(StarletteHTTPException)
    @app.exception_handler(HTTPException)
    async def http_handler(request: Request, exc: HTTPException):
        message = exc.detail if isinstance(exc.detail, str) else "HTTP Error"

        body = BaseResponse(
            success=False,
            message=message,
            data=None,
            errorCode=getattr(exc, "error_code", "HTTP_ERROR"),
        )

        return JSONResponse(
            status_code=exc.status_code,
            content=body.model_dump(),
        )

    # 나머지는 내부 사정을 감추고 500 하나로. 원인은 로그(요청 ID 포함)로만 남긴다
    @app.exception_handler(Exception)
    async def unhandled_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}")
        body = BaseResponse(
            success=False,
            message="Internal Server Error",
            data=None,
            errorCode="INTERNAL_ERROR",
        )

        return JSONResponse(
            status_code=500,
            content=body.model_dump(),
        )
