# 역할: FastAPI 앱 조립 — 로깅 · 예외 핸들러 · 미들웨어 · 라우터 등록과 media 정적 마운트
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.core.config.settings import settings
from app.core.middleware.register import setup_middlewares
from app.core.exception.handler import setup_exceptions
from app.core.logging import setup_logging, get_logger
# module/__init__.py 가 모든 모델을 Base 에 등록하고 setup_routers 를 내보낸다
from app.module import *

# 로깅 설정
setup_logging()
logger = get_logger(__name__)

# Lifespan: 서버 시작과 종료 시 실행될 로직
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Backend 시작 중...")

    yield
    print("Backend 종료 중...")


def create_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)
    
    # 1. 예외 핸들러 등록 (가장 먼저 혹은 미들웨어 직후에 등록 권장)
    setup_exceptions(app)
    
    # 2. CORS 및 보안 헤더 미들웨어 등록
    setup_middlewares(app)
    
    # 3. 라우터 등록
    setup_routers(app)
    
    return app


# FastAPI 실행 인스턴스
app = create_app()
# 업로드 이미지는 앱이 직접 서빙한다. DB 의 media/... 상대경로가 그대로 URL 경로가 된다
app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")
