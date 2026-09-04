# 역할: 관리자 전용 엔드포인트 자리. 로그인 · 로그아웃은 auth_router 에 있어 아직 비어 있다

from fastapi import APIRouter

from app.core.provider.http.endpoint import with_provider
from app.core.provider.http.login import with_login
from app.core.provider.http.service import ServiceProvider

router = APIRouter()