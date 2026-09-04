# 역할: 포트폴리오 공개 조회 API 와 관리자 저장 · 이미지 업로드 API

from fastapi import APIRouter

from app.core.provider.http.endpoint import with_provider
from app.core.provider.http.login import with_login
from app.core.provider.http.service import ServiceProvider
from app.core.utils.response import success

router = APIRouter()


@router.get("/info")
@with_provider
async def get_portfolio_info(p: ServiceProvider):
    """공개 조회 — 포트폴리오 화면이 그린다"""
    return success(await p.portfolio_service.get_info())


@router.post("/info")
@with_provider
@with_login("admin")
async def update_portfolio_info(p: ServiceProvider):
    return success(await p.portfolio_service.update_info(p.request))


@router.post("/info/image")
@with_provider
@with_login("admin")
async def upload_portfolio_image(p: ServiceProvider):
    """이미지를 media/ 에 저장하고 상대경로를 돌려준다.

    form: file(이미지), kind("profile" | "link")
    DB 반영은 /info 저장에서 한다.
    """
    return success(await p.portfolio_service.upload_image(p.request))


# ── Tech Stack ───────────────────────────────────────────────


@router.get("/stack")
@with_provider
async def get_portfolio_stack(p: ServiceProvider):
    """공개 조회"""
    return success(await p.portfolio_service.get_stack())


@router.post("/stack")
@with_provider
@with_login("admin")
async def update_portfolio_stack(p: ServiceProvider):
    """카테고리 목록을 통째로 저장한다. body: {"categories": [...]}"""
    return success(await p.portfolio_service.update_stack(p.request))


# ── Approach ─────────────────────────────────────────────────


@router.get("/approach")
@with_provider
async def get_portfolio_approaches(p: ServiceProvider):
    """공개 조회"""
    return success(await p.portfolio_service.get_approaches())


@router.post("/approach")
@with_provider
@with_login("admin")
async def update_portfolio_approaches(p: ServiceProvider):
    """카드 목록을 통째로 저장한다. body: {"approaches": [...]}"""
    return success(await p.portfolio_service.update_approaches(p.request))


# ── Projects ─────────────────────────────────────────────────
# 프로젝트는 건수가 많아 섹션 통째로 저장하지 않고 한 건씩 다룬다.
# 순서는 시작일 내림차순으로 고정이라 순서 저장 API 가 없다.


@router.get("/project")
@with_provider
async def get_portfolio_projects(p: ServiceProvider):
    """공개 조회 — 켜진(visible) 것만, 시작일 내림차순"""
    return success(await p.portfolio_service.get_projects())


@router.get("/project/all")
@with_provider
@with_login("admin")
async def get_all_portfolio_projects(p: ServiceProvider):
    """관리자 조회 — 꺼둔 것까지 전부"""
    return success(await p.portfolio_service.get_projects(include_hidden=True))


@router.post("/project")
@with_provider
@with_login("admin")
async def save_portfolio_project(p: ServiceProvider):
    """한 건 저장. body 에 id 가 있으면 수정, 없으면 추가"""
    return success(await p.portfolio_service.save_project(p.request))


@router.post("/project/delete")
@with_provider
@with_login("admin")
async def delete_portfolio_project(p: ServiceProvider):
    """body: {"id": 1}"""
    return success(await p.portfolio_service.delete_project(p.request))

