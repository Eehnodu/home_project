# 역할: WebSocket 핸드셰이크 쿠키의 JWT 를 검증해 websocket 객체에 user_id · auth_type 을 싣는 데코레이터

from functools import wraps

from fastapi import HTTPException, WebSocket

from app.module.auth.auth_token import AuthToken


def with_login_web_socket(type: str = "user"):
    """
    WebSocket용 로그인 필수 (기본: user)
    admin API에서는 with_login_web_socket("admin") 사용
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(p, websocket: WebSocket, *args, **kwargs):
            token_util = AuthToken()
            try:
                user_id, auth_type = await token_util.get_token_info_ws(
                    websocket,
                    type,
                )
                websocket.user_id = user_id
                websocket.auth_type = auth_type
            except HTTPException as e:
                raise e
            return await func(p, websocket, *args, **kwargs)
        return wrapper
    return decorator


def without_login_web_socket(func):
    """
    로그인이 필요 없는 WebSocket 연결용 데코레이터
    """

    @wraps(func)
    async def wrapper(p, websocket: WebSocket, *args, **kwargs):
        # 인증 없이 기본값 주입
        websocket.user_id = "guest_user"
        websocket.auth_type = "guest"

        return await func(p, websocket, *args, **kwargs)

    return wrapper
