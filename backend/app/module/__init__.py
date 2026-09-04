# app/module/__init__.py
from fastapi import FastAPI

# --- 라우터 등록 함수 ---
from app.module.admin import admin_router
from app.module.auth import auth_router
from app.module.chatbot import chatbot_router
from app.module.portfolio import portfolio_router
from app.module.user import user_router
from app.module.web_socket import web_socket_router
# --- 모델 등록 (SQLAlchemy 관계 인식용) ---
from app.module.admin.admin import Admin
from app.module.chatbot.chatbot import ChatbotMessage, ChatbotSession, ChatbotSetting
from app.module.portfolio.portfolio import (
    PortfolioApproach,
    PortfolioInfo,
    PortfolioProject,
    PortfolioStackCategory,
)
from app.module.user.user import User


def setup_routers(app: FastAPI):
    app.include_router(auth_router.router, prefix="/api/auth")
    app.include_router(admin_router.router, prefix="/api/admin")
    app.include_router(user_router.router, prefix="/api/user")
    app.include_router(portfolio_router.router, prefix="/api/portfolio")
    app.include_router(chatbot_router.router, prefix="/api/chatbot")
    app.include_router(web_socket_router.router, prefix="/api/ws")