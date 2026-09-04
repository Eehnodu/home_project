# 역할: 모든 API 응답을 {success, message, data, errorCode} 한 가지 모양으로 맞추는 헬퍼

from typing import Any, Optional

from fastapi import HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class BaseResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    errorCode: Optional[str] = None


def success(
    data: Any = None,
    message: str = "ok",
    status_code: int = 200,
):
    body = BaseResponse(
        success=True,
        message=message,
        data=data,
        errorCode=None,
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(),
    )


def fail(
    message: str,
    error_code: Optional[str] = None,
    status_code: int = 400,
):
    """
    어디서든(서비스/라우터) 호출 가능한 공통 실패 헬퍼.
    실제 응답은 exception handler가 BaseResponse로 만들어줌.

    raise 로 끝나므로 호출부는 return 없이 fail(...) 한 줄로 흐름을 끊는다.
    서비스 계층이 Response 객체를 몰라도 되게 하는 장치다.
    """
    exc = HTTPException(
        status_code=status_code,
        detail=message,
    )
    setattr(exc, "error_code", error_code)
    raise exc
