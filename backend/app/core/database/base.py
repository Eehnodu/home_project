# 역할: SQLAlchemy 비동기 엔진 · 세션 팩토리 · 전역 Base · KST 시각 헬퍼
from datetime import datetime
from typing import Optional

import pytz
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config.settings import DATABASE_URL

KST = pytz.timezone("Asia/Seoul")

# --- DB 엔진/세션 설정 ---
# pool_pre_ping: MySQL 이 유휴 커넥션을 끊어도 첫 쿼리가 실패하지 않게 연결을 먼저 확인한다
engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    # commit 뒤 속성 접근이 다시 SELECT 를 타지 않게 한다. async 에서는 그 지연 로딩이 예외가 된다
    expire_on_commit=False,
)

async def get_session():
    async with SessionLocal() as session:
        yield session

# "2026.03.17" 처럼 점으로 들어온 날짜도 받는다
def parse_date(d: Optional[str]):
    if not d:
        return None
    d = d.replace(".", "-")
    return datetime.strptime(d, "%Y-%m-%d")

def now_kst():
    return datetime.now(KST)

# --- 전역 단일 Base ---
Base = declarative_base()

def register_base():
    """모든 도메인에서 같은 Base를 사용하도록 고정"""
    return Base
