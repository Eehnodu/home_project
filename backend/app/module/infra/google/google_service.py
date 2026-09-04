# 역할: Google OAuth 코드 교환과 사용자 정보 조회. 관리자 로그인은 허용 이메일 하나만 통과시킨다

from app.core.config.settings import settings
from app.module.admin.admin_repository import AdminRepository
import httpx
from fastapi import HTTPException

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


class GoogleService:
    def __init__(self, admin_repo: AdminRepository):
        self.admin_repo = admin_repo

    async def _get_userinfo(self, code: str, redirect_uri: str) -> dict:
        token_data = {
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(GOOGLE_TOKEN_URL, data=token_data)
            try:
                token_resp.raise_for_status()
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=401, detail=f"google token request failed: {e.response.text}")

            access_token = token_resp.json().get("access_token")
            if not access_token:
                raise HTTPException(status_code=500, detail="access token missing")

            userinfo_resp = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            userinfo_resp.raise_for_status()
            return userinfo_resp.json()

    async def google_login(self, request):
        body = await request.json()
        code = body.get("code")
        if not code:
            raise HTTPException(status_code=400, detail="Authorization code not provided")

        userinfo = await self._get_userinfo(code, settings.google_redirect_uri)
        email = userinfo.get("email")
        name = userinfo.get("name")
        picture = userinfo.get("picture", "")

        user, created = await self.user_repo.get_or_create_user(email, name, picture)
        if created:
            await self.user_repo.db.commit()

        return user

    async def google_admin_login(self, request):
        body = await request.json()
        code = body.get("code")
        if not code:
            raise HTTPException(status_code=400, detail="Authorization code not provided")

        userinfo = await self._get_userinfo(code, settings.google_redirect_uri)
        email = userinfo.get("email")

        # 관리자 가입 절차가 없다. .env 의 admin_email 과 같은 계정만 관리자다
        if not settings.admin_email or email != settings.admin_email:
            raise HTTPException(status_code=403, detail="접근 권한이 없습니다.")

        admin = await self.admin_repo.get_or_create_admin(email)
        await self.admin_repo.db.commit()
        await self.admin_repo.db.refresh(admin)

        return admin
