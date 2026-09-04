# 역할: 요청 단위 DI 컨테이너. repository · service 를 처음 쓸 때 한 번만 만들어 돌려준다

from fastapi import Depends, Request

from app.core.database.base import get_session


# 프로퍼티 안에서 import 하는 이유: service 가 다른 service · repository 를 물고 있어
# 모듈 상단에서 다 불러오면 순환 import 가 생긴다. 필요할 때 불러오면 라우터 하나가
# 쓰는 것만 만들어지고, 요청마다 DB 세션 하나를 모두가 공유한다
class ServiceProvider:
    def __init__(self, request: Request, db):
        self.request = request
        self.db = db
        self._redis_service = None
        self._user_repo = None
        self._admin_repo = None
        self._user_service = None
        self._auth_service = None
        self._admin_service = None
        self._google_service = None
        self._gemini_service = None
        self._portfolio_repo = None
        self._portfolio_service = None
        self._chatbot_repo = None
        self._chatbot_service = None

    @property
    def user_repo(self):
        if not self._user_repo:
            from app.module.user.user_repository import UserRepository
            self._user_repo = UserRepository(self.db)
        return self._user_repo

    @property
    def admin_repo(self):
        if not self._admin_repo:
            from app.module.admin.admin_repository import AdminRepository
            self._admin_repo = AdminRepository(self.db)
        return self._admin_repo

    @property
    def portfolio_repo(self):
        if not self._portfolio_repo:
            from app.module.portfolio.portfolio_repository import PortfolioRepository
            self._portfolio_repo = PortfolioRepository(self.db)
        return self._portfolio_repo

    @property
    def portfolio_service(self):
        if not self._portfolio_service:
            from app.module.portfolio.portfolio_service import PortfolioService
            self._portfolio_service = PortfolioService(self.portfolio_repo)
        return self._portfolio_service

    @property
    def chatbot_repo(self):
        if not self._chatbot_repo:
            from app.module.chatbot.chatbot_repository import ChatbotRepository
            self._chatbot_repo = ChatbotRepository(self.db)
        return self._chatbot_repo

    @property
    def chatbot_service(self):
        if not self._chatbot_service:
            from app.module.chatbot.chatbot_service import ChatbotService
            self._chatbot_service = ChatbotService(
                self.chatbot_repo,
                self.portfolio_repo,
                self.gemini_service,
                self.redis_service,
            )
        return self._chatbot_service

    @property
    def user_service(self):
        if not self._user_service:
            from app.module.user.user_service import UserService
            self._user_service = UserService(self.user_repo)
        return self._user_service

    @property
    def admin_service(self):
        if not self._admin_service:
            from app.module.admin.admin_service import AdminService
            self._admin_service = AdminService(self.admin_repo)
        return self._admin_service

    @property
    def auth_service(self):
        if not self._auth_service:
            from app.module.auth.auth_service import AuthService
            self._auth_service = AuthService(self.user_repo, self.admin_repo)
        return self._auth_service

    @property
    def google_service(self):
        if not self._google_service:
            from app.module.infra.google.google_service import GoogleService
            self._google_service = GoogleService(self.admin_repo)
        return self._google_service

    @property
    def gemini_service(self):
        if not self._gemini_service:
            from app.module.infra.gemini.gemini_service import GeminiService

            self._gemini_service = GeminiService()
        return self._gemini_service

    @property
    def redis_service(self):
        if not self._redis_service:
            from app.module.infra.redis.redis_service import RedisService

            self._redis_service = RedisService()
        return self._redis_service

async def get_provider(
    request: Request,
    db=Depends(get_session),
):
    return ServiceProvider(request, db)
