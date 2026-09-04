# 역할: .env 를 읽어 local / prod 에 맞는 설정값을 프로퍼티로 제공하는 전역 settings
import os
import socket
from pathlib import Path
from typing import List, Optional
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class RawEnv(BaseSettings):
    # MySQL 설정

    # LOCAL
    local_mysql_port: int
    local_mysql_user: str
    local_mysql_password: str
    local_mysql_host: str
    local_mysql_db: str

    # PROD
    prod_mysql_port: int
    prod_mysql_user: str
    prod_mysql_password: str
    prod_mysql_host: str
    prod_mysql_db: str

    jwt_secret: str
    hash_key: str

    # API keys
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None

    # KAKAO
    kakao_client_id: Optional[str] = None
    kakao_client_secret: Optional[str] = None
    local_kakao_redirect_uri: Optional[str] = None
    prod_kakao_redirect_uri: Optional[str] = None

    # GOOGLE
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    local_google_redirect_uri: Optional[str] = None
    prod_google_redirect_uri: Optional[str] = None
    admin_email: Optional[str] = None

    # REDIS
    local_redis_host: str
    local_redis_port: int
    local_redis_password: Optional[str]

    prod_redis_host: str
    prod_redis_port: int
    prod_redis_password: Optional[str]

    # .env 는 backend/ 루트에 있다. 실행 위치와 무관하게 이 파일 기준으로 찾는다
    model_config = SettingsConfigDict(env_file=os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"), env_file_encoding="utf-8")

class Settings:
    def __init__(self):
        self.raw = RawEnv()
        self.env = self._detect_env()
        self.BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
        self.APP_DIR = self.BASE_DIR / "app"
        self.MEDIA_ROOT = self.BASE_DIR / "media"                       

    # 환경변수 대신 호스트명으로 환경을 가른다. 배포 서버 이름에 묶어 두면
    # .env 한 줄을 빠뜨려 운영에서 로컬 DB 를 보는 실수가 나지 않는다
    def _detect_env(self) -> str:
        hostname = socket.gethostname().lower()
        if hostname == "homeserver":
            return "prod"
        return "local"

    # MySQL — 접두사(local_ / prod_)만 환경에 따라 바꿔 같은 이름의 프로퍼티로 읽는다
    @property
    def mysql_user(self) -> str:
        return getattr(self.raw, f"{self.env}_mysql_user")

    @property
    def mysql_password(self) -> str:
        return getattr(self.raw, f"{self.env}_mysql_password")

    @property
    def mysql_host(self) -> str:
        return getattr(self.raw, f"{self.env}_mysql_host")

    @property
    def mysql_db(self) -> str:
        return getattr(self.raw, f"{self.env}_mysql_db")

    @property
    def mysql_port(self) -> int:
        return getattr(self.raw, f"{self.env}_mysql_port")

    # Redis (local/prod 자동 전환 — mysql 과 같은 방식)
    @property
    def redis_host(self) -> str:
        return getattr(self.raw, f"{self.env}_redis_host")

    @property
    def redis_port(self) -> int:
        return getattr(self.raw, f"{self.env}_redis_port")

    @property
    def redis_password(self) -> Optional[str]:
        return getattr(self.raw, f"{self.env}_redis_password")

    # SQLAlchemy용 비동기 DB URL
    @property
    def database_url(self) -> str:
        user = quote_plus(self.mysql_user)
        password = quote_plus(self.mysql_password)
        host = self.mysql_host
        return (
            f"mysql+aiomysql://{user}:{password}"
            f"@{host}:{self.mysql_port}/{self.mysql_db}"
        )
    
    @property
    def jwt_secret(self) -> str:
        return self.raw.jwt_secret

    @property
    def hash_key(self) -> str:
        return self.raw.hash_key

    # API Keys
    @property
    def openai_api_key(self) -> Optional[str]:
        return self.raw.openai_api_key

    @property
    def gemini_api_key(self) -> Optional[str]:
        """포트폴리오 우측 하단 챗봇용. 없어도 앱은 뜬다 — 챗봇만 비활성"""
        return self.raw.gemini_api_key
    
    @property
    def kakao_client_id(self) -> Optional[str]:
        return self.raw.kakao_client_id

    @property
    def kakao_client_secret(self) -> Optional[str]:
        return self.raw.kakao_client_secret

    @property
    def kakao_redirect_uri(self) -> Optional[str]:
        return getattr(self.raw, f"{self.env}_kakao_redirect_uri")

    @property
    def google_client_id(self) -> Optional[str]:
        return self.raw.google_client_id    
    
    @property
    def google_client_secret(self) -> Optional[str]:
        return self.raw.google_client_secret    
    
    @property
    def google_redirect_uri(self) -> str:
        return getattr(self.raw, f"{self.env}_google_redirect_uri")

    @property
    def admin_email(self) -> Optional[str]:
        return self.raw.admin_email

# 전역 인스턴스
settings = Settings()
DATABASE_URL = settings.database_url
