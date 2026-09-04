# 역할: 포트폴리오 섹션 DB 쿼리. 목록형 섹션은 통째로 교체, 프로젝트는 건별 CRUD

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.module.portfolio.portfolio import (
    PortfolioApproach,
    PortfolioInfo,
    PortfolioProject,
    PortfolioStackCategory,
)

# Info 는 한 행만 쓴다
INFO_ID = 1


class PortfolioRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_info(self) -> PortfolioInfo | None:
        result = await self.db.execute(
            select(PortfolioInfo).where(PortfolioInfo.id == INFO_ID)
        )
        return result.scalar_one_or_none()

    async def upsert_info(self, fields: dict) -> PortfolioInfo:
        info = await self.get_info()

        if info is None:
            info = PortfolioInfo(id=INFO_ID, **fields)
            self.db.add(info)
        else:
            for key, value in fields.items():
                setattr(info, key, value)

        await self.db.commit()
        await self.db.refresh(info)
        return info


    # ── 목록형 섹션 공통 ─────────────────────────────────────

    async def _list(self, model):
        result = await self.db.execute(
            select(model).order_by(model.sort_order, model.id)
        )
        return list(result.scalars().all())

    async def _replace_all(self, model, rows: list[dict]):
        """관리자 화면이 섹션을 통째로 저장하므로 목록 전체를 payload 에 맞춘다.

        id 가 있으면 갱신, 없으면 추가, payload 에 없는 기존 행은 삭제한다.
        전부 지우고 다시 넣지 않는 이유는 id 가 바뀌면 참조가 끊기기 때문이다.
        """
        existing = {row.id: row for row in await self._list(model)}
        kept: set[int] = set()

        for order, fields in enumerate(rows):
            row_id = fields.pop("id", None)
            fields["sort_order"] = order

            if row_id and row_id in existing:
                row = existing[row_id]
                for key, value in fields.items():
                    setattr(row, key, value)
                kept.add(row_id)
            else:
                self.db.add(model(**fields))

        for row_id, row in existing.items():
            if row_id not in kept:
                await self.db.delete(row)

        await self.db.commit()
        return await self._list(model)

    # ── Tech Stack ───────────────────────────────────────────

    async def list_stack_categories(self) -> list[PortfolioStackCategory]:
        return await self._list(PortfolioStackCategory)

    async def replace_stack_categories(self, rows: list[dict]):
        return await self._replace_all(PortfolioStackCategory, rows)

    # ── Approach ─────────────────────────────────────────────

    async def list_approaches(self) -> list[PortfolioApproach]:
        return await self._list(PortfolioApproach)

    async def replace_approaches(self, rows: list[dict]):
        return await self._replace_all(PortfolioApproach, rows)

    # ── Projects ─────────────────────────────────────────────
    # 프로젝트는 20건이 넘고 필드도 많아 섹션 통째로 저장하지 않는다.
    # 한 건씩 추가·수정·삭제한다. 순서는 시작일 내림차순(최근 작업이 위).

    async def list_projects(self, visible_only: bool = False) -> list[PortfolioProject]:
        query = select(PortfolioProject)
        if visible_only:
            query = query.where(PortfolioProject.visible.is_(True))
        result = await self.db.execute(
            query.order_by(
                # 시작일이 없는 행은 뒤로
                PortfolioProject.start_date.is_(None),
                PortfolioProject.start_date.desc(),
                PortfolioProject.id.desc(),
            )
        )
        return list(result.scalars().all())

    async def get_project(self, project_id: int) -> PortfolioProject | None:
        result = await self.db.execute(
            select(PortfolioProject).where(PortfolioProject.id == project_id)
        )
        return result.scalar_one_or_none()

    async def create_project(self, fields: dict) -> PortfolioProject:
        project = PortfolioProject(**fields)
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def update_project(
        self, project: PortfolioProject, fields: dict
    ) -> PortfolioProject:
        for key, value in fields.items():
            setattr(project, key, value)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def delete_project(self, project: PortfolioProject) -> None:
        await self.db.delete(project)
        await self.db.commit()
