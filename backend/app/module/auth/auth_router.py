# 역할: 로그인 · 로그아웃 · 토큰 갱신 · Google 소셜 로그인 엔드포인트

from fastapi import APIRouter, HTTPException

from app.core.provider.http.endpoint import with_provider
from app.core.provider.http.login import with_login
from app.core.provider.http.service import ServiceProvider
from app.core.utils.response import success

router = APIRouter()

@router.post("/login")
@with_provider
async def login(p: ServiceProvider):
    user, auth_type = await p.auth_service.login(p.request)
    # 토큰은 본문이 아니라 쿠키로 나간다. 응답을 먼저 만들고 그 위에 set_cookie 한다
    response = success(message="user login successful")
    await p.auth_service.token_util.create_jwt_token(user, response, auth_type)
    return response

@router.post("/logout")
@with_provider
@with_login()
async def logout(p:ServiceProvider):
    auth_type = p.request.auth_type
    response = success(message="user logout successful")
    await p.auth_service.token_util.delete_token(response, auth_type)
    return response

@router.post("/logout_admin")
@with_provider
@with_login("admin")
async def logout_admin(p: ServiceProvider):
    auth_type = p.request.auth_type
    response = success(message="admin logout successful")
    await p.auth_service.token_util.delete_token(response, auth_type)
    return response

@router.post("/refresh_token")
@with_provider
async def refresh_token(p: ServiceProvider):
    # refresh 쿠키만 검증하고 access · refresh 를 모두 새로 발급한다 — 쓰는 동안은 만료가 밀린다
    id, _ = await p.auth_service.token_util.verify_refresh_by_type(p.request, "user")
    user = await p.user_service.get_user_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    response = success(message="user login successful")
    await p.auth_service.token_util.create_jwt_token(user, response, "user")
    return response

@router.post("/refresh_token_admin")
@with_provider
async def refresh_token_admin(p: ServiceProvider):
    id, _ = await p.auth_service.token_util.verify_refresh_by_type(p.request, "admin")
    admin = await p.admin_service.get_admin_by_id(id)
    if not admin:
        raise HTTPException(status_code=404, detail="admin not found")
    response = success(message="admin login successful")
    await p.auth_service.token_util.create_jwt_token(admin, response, "admin")
    return response

@router.post("/google")
@with_provider
async def google_login(p: ServiceProvider):
    user = await p.google_service.google_login(p.request)
    response = success(message="user login successful")
    await p.auth_service.token_util.create_jwt_token(user, response, "user")
    return response

@router.post("/google_admin")
@with_provider
async def google_admin_login(p: ServiceProvider):
    admin = await p.google_service.google_admin_login(p.request)
    response = success(message="admin login successful")
    await p.auth_service.token_util.create_jwt_token(admin, response, "admin")
    return response

@router.post("/kakao")
@with_provider
async def kakao_login(p: ServiceProvider):
    user = await p.kakao_service.kakao_login(p.request)
    response = success(message="user login successful")
    await p.auth_service.token_util.create_jwt_token(user, response, "user")
    return response
