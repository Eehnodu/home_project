# 역할: 일반 사용자 모델 (이메일 가입 또는 소셜 로그인)

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.core.database.base import Base, now_kst


class User(Base):
    __tablename__ = "tb_users"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=True)
    name = Column(String(20), nullable=False)
    profile_image = Column(String(200), nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now_kst)
    last_login_at = Column(DateTime(timezone=True))
