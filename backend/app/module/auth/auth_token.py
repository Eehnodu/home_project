# 역할: JWT 발급 · 검증과 인증 쿠키(access · refresh · user_info · refresh_exp) 관리

import base64
import json
import uuid
from datetime import timedelta

import jwt
from fastapi import HTTPException

from app.core.config.settings import settings
from app.core.database.base import now_kst


class AuthToken:
    env = getattr(settings, "env", "dev")
    samesite = "None" if env == "prod" else "Lax"
    domain = "noduu.duckdns.org" if env == "prod" else None

    def __init__(self):
        self.jwt_secret = settings.jwt_secret
        self.hash_key = settings.hash_key
        self.algorithm = "HS256"
        self.env = getattr(settings, "env", "dev")
        # 운영에서는 프론트(duckdns 도메인)와 API 가 다른 출처라 크로스사이트 쿠키가 된다.
        # 브라우저는 SameSite=None 을 Secure(HTTPS) 와 함께 요구하고, domain 을 명시해야
        # 서브도메인 사이에서도 같은 쿠키를 본다. 로컬은 http 라 Lax · domain 없음으로 둔다
        self.samesite = "None" if self.env == "prod" else "Lax"
        self.domain = "noduu.duckdns.org" if self.env == "prod" else None
        self.secure = True if self.env == "prod" else False
    
    # --- 쿠키 접두사 생성 ---
    def _cookie_prefix(self, auth_type: str):
        return "admin_" if auth_type == "admin" else "user_"

    # --- 공통 로직 분리 ---
    def _get_user_from_cookies(self, cookies, auth_type: str):
        prefix = self._cookie_prefix(auth_type)

        access_token = cookies.get(f"{prefix}access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="ACCESS_TOKEN_MISSING")

        try:
            payload = jwt.decode(
                access_token,
                self.jwt_secret,
                algorithms=[self.algorithm],
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="ACCESS_TOKEN_EXPIRED")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="ACCESS_TOKEN_INVALID")

        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="INVALID_TOKEN_TYPE")

        if payload.get("user") != auth_type:
            raise HTTPException(status_code=401, detail="INVALID_TOKEN_TYPE")

        return int(payload["sub"]), payload["user"]

    # --- HTTP용 ---
    async def get_token_info(self, request, auth_type: str):
        """유저 아이디 토큰에서 파싱 (HTTP Request)"""
        return self._get_user_from_cookies(request.cookies, auth_type)

    # --- WebSocket용 ---
    async def get_token_info_ws(self, websocket, auth_type: str):
        """유저 아이디 토큰에서 파싱 (WebSocket)"""
        return self._get_user_from_cookies(websocket.cookies, auth_type)
    
    # --- 토큰 생성 ---
    async def create_jwt_token(self, user, response, type):
        now_kr = now_kst()
        prefix = self._cookie_prefix(type)

        # access 1시간 · refresh 6시간. access 가 짧아야 탈취돼도 피해가 짧고, refresh 로 조용히 이어간다
        access_payload = {
            "sub": str(user.id),
            "user": type,
            "type": "access",
            "exp": now_kr + timedelta(hours=1),
        }

        refresh_payload = {
            "sub": str(user.id),
            "user": type,
            "type": "refresh",
            "exp": now_kr + timedelta(hours=6),
        }

        access_token = jwt.encode(access_payload, self.jwt_secret, algorithm=self.algorithm)
        refresh_token = jwt.encode(refresh_payload, self.jwt_secret, algorithm=self.algorithm)

        session_info = {
            "auth_type": type,
            "id": user.id,
            "user_nickname": "admin" if type == "admin" else user.user_name,
            "created_at": user.created_at.isoformat() if user.created_at else None, 
        }

        # user_info 는 프론트가 읽어 화면(이름 · 권한)을 그리는 용도라 base64(JSON) 평문으로 둔다
        encoded_info = base64.b64encode(
            json.dumps(session_info, ensure_ascii=False).encode("utf-8")
        ).decode("utf-8")

        cookie_common = {
            "secure": self.secure,
            "samesite": self.samesite,
            "path": "/",
        }
        # prod일 때만 domain 붙이기
        if self.domain:
            cookie_common["domain"] = self.domain

        response.set_cookie(
            key=f"{prefix}user_info",
            value=encoded_info,
            httponly=False,  # 프론트가 읽어야 한다. 토큰이 아니라 표시용 정보만 담는다
            max_age=3600,
            **cookie_common,
        )

        response.set_cookie(
            key=f"{prefix}access_token",
            value=access_token,
            httponly=True,
            max_age=3600,
            **cookie_common,
        )

        response.set_cookie(
            key=f"{prefix}refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=21600,
            **cookie_common,
        )

        # refresh_token 은 httponly 라 프론트가 존재를 알 수 없다. 같은 만료로 심는 이 표지 쿠키를
        # 보고 "갱신을 시도할지, 바로 로그인으로 보낼지" 를 판단한다. 값 자체에는 의미가 없다
        response.set_cookie(
            key=f"{prefix}refresh_exp",
            value=jwt.encode({"uuid": str(uuid.uuid4())}, settings.jwt_secret, algorithm="HS256"),
            **cookie_common,
            max_age=21600,
        )

    async def verify_refresh_by_type(self, request, auth_type: str):
        """
        지정된 auth_type의 refresh_token만 검증한다.
        - auth_type: "user" | "admin"
        """
        if auth_type not in ("user", "admin"):
            raise HTTPException(status_code=400, detail="INVALID_AUTH_TYPE")

        prefix = self._cookie_prefix(auth_type)
        refresh_token = request.cookies.get(f"{prefix}refresh_token")
        if not refresh_token:
            raise HTTPException(status_code=401, detail="REFRESH_TOKEN_MISSING")

        try:
            payload = jwt.decode(
                refresh_token,
                self.jwt_secret,
                algorithms=[self.algorithm],
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="REFRESH_TOKEN_EXPIRED")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="INVALID_REFRESH_TOKEN")

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="INVALID_TOKEN_TYPE")

        user_id = payload.get("sub")
        token_type = payload.get("user")

        if not user_id or token_type != auth_type:
            raise HTTPException(status_code=401, detail="INVALID_REFRESH_PAYLOAD")

        return int(user_id), auth_type

    async def delete_token(self, response, auth_type: str):
        """토큰 삭제 및 로그아웃 처리"""
        prefix = self._cookie_prefix(auth_type)
        cookie_common = {
            "secure": self.secure,
            "samesite": self.samesite,
            "path": "/",
        }
        # prod일 때만 domain 붙이기
        if self.domain:
            cookie_common["domain"] = self.domain

        response.delete_cookie(f"{prefix}access_token", **cookie_common)
        response.delete_cookie(f"{prefix}refresh_token", **cookie_common)
        response.delete_cookie(f"{prefix}user_info", **cookie_common)
        response.delete_cookie(f"{prefix}refresh_exp", **cookie_common)