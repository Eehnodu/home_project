# 역할: 관리자 계정 조회 로직 (토큰 갱신 때 존재 확인용)

from app.module.admin.admin import Admin
from app.module.admin.admin_repository import AdminRepository


class AdminService:
    def __init__(self, admin_repo: AdminRepository):
        self.admin_repo = admin_repo

    async def get_admin_by_id(self, id: int) -> Admin:
        return await self.admin_repo.get_admin_by_id(id)