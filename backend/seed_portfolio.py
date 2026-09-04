"""포트폴리오 Info 섹션 초기 데이터 입력.

화면에 하드코딩돼 있던 내용을 그대로 DB 에 넣는다.
이미 값이 있으면 덮어쓰지 않는다 — 관리자 화면에서 수정한 내용을 날리면 안 된다.

    ./seedPortfolio.sh          # 비어 있을 때만 입력
    ./seedPortfolio.sh --force  # 기존 값을 덮어쓴다

주의: 테이블이 먼저 있어야 한다. `./migrate.sh` 를 먼저 실행할 것.
"""

import asyncio
import sys

from app.core.database.base import SessionLocal, engine
from app.module.portfolio.portfolio_repository import PortfolioRepository

INFO = {
    "subtitle": "저에 대한 소개입니다.",
    "role_label": "풀스택 개발자",
    "name": "우동희",
    "headline": "만드는 게 좋아서 시작했고,\n지금은 AI 로 더 넓게 만듭니다.",
    "description": (
        "무언가를 직접 만들어 내는 일이 좋아 개발을 시작했고, AI 가 빠르게 발전하면서 이제는 AI 를 서비스 안에 녹여 혼자서는 어려웠던 기능까지 실제로 동작하는 제품으로 만듭니다. 백엔드와 프론트엔드, 서버 운영까지 직접 다루며, 반복되는 구조는 템플릿으로 정리해 다음 프로젝트를 더 빨리 시작합니다."
    ),
    "profile_image": None,
    "tags": ["Backend", "Frontend", "Server"],
    "links": [
        {
            "label": "GitHub",
            "sub": "github.com/Eehnodu",
            "href": "https://github.com/Eehnodu",
            "icon_image": None,
        },
        {
            "label": "Tistory",
            "sub": "eehnodu.tistory.com",
            "href": "https://eehnodu.tistory.com/",
            "icon_image": None,
        },
        {
            "label": "Portfolio",
            "sub": "성장 과정 · 프로젝트 · 외부 연동 정리 (Notion)",
            "href": "https://oil-football-a51.notion.site/3dc0669f896d816ea3d6ca10a9e131d8",
            "icon_image": None,
        },
    ],
    "careers": [
        {
            "org": "제로스트에이아이",
            "role": "풀스택 개발자",
            "period": "2025.02 ~ 2026.09",
            "items": [
                "수주 프로젝트 19건 · 자사 서비스 2건을 기획부터 배포 · 운영까지",
                "챗봇 · AI 생성 · 실시간 통역 · ERP 등 성격이 다른 서비스를 고객사 요구에 맞춰 각각 설계 · 구현",
                "반복되는 인증 · 로깅 · 공통 UI 는 템플릿으로 정리해 이후 프로젝트에 재사용",
            ],
        },
    ],
    "educations": [
        {"school": "전남대학교", "major": "컴퓨터정보통신공학부", "period": "2024.03 졸업"},
    ],
    "certificates": [
        {"name": "정보처리기사", "issuer": "한국산업인력공단", "date": ""},
    ],
    # 공개 화면 구성. 관리자 화면에서 바꾼다 — 사이드바형(한 페이지 스크롤)으로 시작
    "layout": "sidebar",
    # 상세로 올리지 않은 프로젝트. 이름만 보인다
    "other_projects": [
        "AI 상담 챗봇 서비스 · 10건 반복 납품",
        "AI 아바타 모의 면접 서비스",
        "AI 글쓰기 검토 서비스",
        "대면 통역 서비스",
        "공공기관 상담 챗봇",
        "세탁 서비스 앱",
        "홍보물 시안 생성 서비스",
        "AI 인터랙티브 스토리 제작툴 (개발 중)",
    ],
}


async def main(force: bool) -> None:
    async with SessionLocal() as db:
        repo = PortfolioRepository(db)
        existing = await repo.get_info()

        if existing is None:
            await repo.upsert_info(INFO)
            print("✅ Info 섹션 초기 데이터를 넣었습니다.")
            return

        if force:
            # 프로필 이미지는 관리자 화면에서 올린 것이라 시드로 덮지 않는다
            fields = {k: v for k, v in INFO.items() if k != "profile_image"}
            await repo.upsert_info(fields)
            print("✅ Info 섹션을 초기 데이터로 덮어썼습니다 (프로필 이미지는 유지).")
            return

        # 비어 있는 칸만 채운다.
        # 관리자 화면에서 이미 넣은 값(예: 업로드한 프로필 이미지)은 건드리지 않는다.
        filled = {}
        for key, value in INFO.items():
            if key == "profile_image":
                continue  # 이미지는 시드로 다루지 않는다
            current = getattr(existing, key, None)
            if not current:
                filled[key] = value

        if not filled:
            print("ℹ️  채울 빈 칸이 없습니다. 전체를 되돌리려면 --force")
            return

        await repo.upsert_info(filled)
        print(f"✅ 빈 칸을 채웠습니다: {', '.join(sorted(filled))}")


async def run() -> None:
    try:
        await main("--force" in sys.argv)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run())
