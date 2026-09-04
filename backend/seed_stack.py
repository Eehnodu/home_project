"""Tech Stack 섹션 초기 데이터 입력.

노션 포트폴리오의 "한눈에" 표와 기술 스택 변천사를 기준으로 실제 프로젝트에서
쓴 기술만 넣는다. 아이콘은 `seed_assets/stack/*.svg`(Simple Icons) 를 media/ 로
복사해 경로까지 함께 저장한다 — 관리자 화면에서 바꿔 올리면 그 값이 우선한다.

    ./seedPortfolio.sh --stack          # 비어 있을 때만
    ./seedPortfolio.sh --stack --force  # 통째로 다시 넣는다 (올린 아이콘 경로는 유지)

주의: 테이블이 먼저 있어야 한다. `./migrate.sh` 를 먼저 실행할 것.
"""

import asyncio
import sys
from pathlib import Path

from app.core.database.base import SessionLocal, engine
from app.core.utils import media
from app.module.portfolio.portfolio_repository import PortfolioRepository

ASSET_DIR = Path(__file__).parent / "seed_assets" / "stack"

# 카테고리 순서가 화면 순서다. 항목 순서도 그대로 보인다.
# 노션 포트폴리오 커버의 네 묶음(백엔드 · 프론트엔드 · 인프라 · AI · 외부 연동)과 같게 두고, 운영에 실제로 쓴 것만 넣는다.
# (기술 이름, seed_assets/stack 의 파일 이름). 파일이 없으면 아이콘 없이 넣는다.
STACKS: list[tuple[str, list[tuple[str, str | None]]]] = [
    (
        "Backend",
        [
            ("Python", "python"),
            ("FastAPI", "fastapi"),
            ("SQLAlchemy", "sqlalchemy"),
            # 공식 로고가 없는 프로젝트라 증류기(alembic) 모양 단색 아이콘(Iconify emojione-monotone)을 쓴다
            ("Alembic", "alembic"),
            ("Celery", "celery"),
            ("Pydantic", "pydantic"),
            ("MySQL", "mysql"),
            ("Redis", "redis"),
            ("WebSocket / SSE", None),
        ],
    ),
    (
        "Frontend",
        [
            ("TypeScript", "typescript"),
            ("React", "react"),
            ("Vite", "vite"),
            ("Tailwind CSS", "tailwind-css"),
            ("TanStack Query", "tanstack-query"),
            ("Capacitor", "capacitor"),
        ],
    ),
    (
        "Infra",
        [
            ("AWS (EC2 · S3 · RDS)", "aws"),
            ("Nginx", "nginx"),
            ("Gunicorn / Uvicorn", "gunicorn"),
            ("Linux", None),
        ],
    ),
    (
        "AI · 외부 연동",
        [
            ("OpenAI", "openai"),
            ("Google Gemini", "google-gemini"),
            ("Claude", "claude"),
            ("ElevenLabs", "elevenlabs"),
            ("HeyGen", None),
            ("Firebase FCM", "firebase"),
            ("Google · Kakao OAuth", None),
        ],
    ),
]


def copy_icon(file_name: str | None) -> str | None:
    """seed_assets 의 SVG 를 media/portfolio/stack 으로 복사하고 상대경로를 돌려준다"""
    if not file_name:
        return None
    source = ASSET_DIR / f"{file_name}.svg"
    if not source.exists():
        print(f"⚠️  아이콘 파일이 없습니다: {source.name}")
        return None
    return media.save_bytes(source.read_bytes(), "svg", "portfolio/stack")


async def main(force: bool) -> None:
    async with SessionLocal() as db:
        repo = PortfolioRepository(db)
        existing = await repo.list_stack_categories()

        if existing and not force:
            print(f"ℹ️  이미 카테고리 {len(existing)}건이 있어 건너뜁니다. 덮어쓰려면 --force")
            return

        # 이미 아이콘이 있는 기술은 그 경로를 살린다 (관리자가 올린 것일 수 있다)
        icons: dict[str, str] = {}
        for category in existing:
            for item in category.items or []:
                if item.get("icon_image"):
                    icons[item["name"]] = item["icon_image"]

        # 같은 이름의 카테고리는 id 를 넘겨 갱신하게 한다 (id 가 바뀌면 참조가 끊긴다)
        ids = {category.name: category.id for category in existing}

        rows = [
            {
                "id": ids.get(name),
                "name": name,
                "items": [
                    {"name": item, "icon_image": icons.get(item) or copy_icon(file_name)}
                    for item, file_name in items
                ],
            }
            for name, items in STACKS
        ]

        # 목록에서 빠진 기술의 아이콘 파일은 정리한다
        kept = {item["icon_image"] for row in rows for item in row["items"] if item["icon_image"]}
        for path in set(icons.values()) - kept:
            media.delete_media(path)

        saved = await repo.replace_stack_categories(rows)
        total = sum(len(row.items or []) for row in saved)
        with_icon = sum(1 for row in saved for item in row.items or [] if item.get("icon_image"))
        print(f"✅ Tech Stack 카테고리 {len(saved)}건 · 기술 {total}건 (아이콘 {with_icon}건)을 넣었습니다.")


async def run() -> None:
    try:
        await main("--force" in sys.argv)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run())
