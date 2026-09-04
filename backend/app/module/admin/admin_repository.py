# 역할: 관리자 계정 DB 조회 · 생성

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.module.admin.admin import Admin


class AdminRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_admin_by_id(self, id: int) -> Admin | None:
        result = await self.db.execute(select(Admin).where(Admin.id == id))
        return result.scalar_one_or_none()

    async def get_admin_by_email(self, email: str) -> Admin | None:
        result = await self.db.execute(select(Admin).where(Admin.email == email))
        return result.scalar_one_or_none()

    async def get_or_create_admin(self, email: str) -> Admin:
        admin = await self.get_admin_by_email(email)
        if not admin:
            admin = Admin(email=email, password="")
            self.db.add(admin)
            # commit 은 로그인 흐름(google_admin_login)이 마무리한다
            await self.db.flush()
        return admin