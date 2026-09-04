# 역할: 이메일 · 비밀번호 로그인과 회원가입 로직. 비밀번호는 argon2 로 해시한다

from passlib.context import CryptContext

from app.core.utils.response import fail
from app.module.admin.admin_repository import AdminRepository
from app.module.auth.auth_token import AuthToken
from app.module.user.user_repository import UserRepository

# argon2 — 메모리를 많이 쓰는 해시라 GPU 대입 공격에 bcrypt 보다 오래 버틴다
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

class AuthService:
    def __init__(self, user_repo: UserRepository, admin_repo: AdminRepository):
        self.user_repo = user_repo
        self.admin_repo = admin_repo
        self.token_util = AuthToken()

    # -- 회원가입
    async def signup(self, request):
        body = await request.json()
        email = body.get("email")
        password = body.get("password")
        nickname = body.get("nickname")
        
        original = await self.user_repo.get_user_by_email(email)
        if original:
            fail("user already exists", "USER_ALREADY_EXISTS", 409)
        else:
            hashed_password = hash_password(password)
            await self.user_repo.create_user(email, nickname, hashed_password)

    # -- 일반 로그인
    async def login(self, request):
        body = await request.json()
        email = body.get("email")
        password = body.get("password")
        auth_type = body.get("type")

        if auth_type == "user":
            user_obj = await self.user_repo.get_user_by_email(email)
        elif auth_type == "admin":
            user_obj = await self.admin_repo.get_admin_by_email(email)
        else:
            fail("invalid type", "INVALID_TYPE", 400)
        if not user_obj or not verify_password(password, user_obj.password if auth_type == "admin" else user_obj.password):
            fail("user does not exists", "USER_DOES_NOT_EXISTS", 404)

        return user_obj, auth_type



    
