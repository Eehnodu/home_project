"""Approach 섹션 초기 데이터 입력.

이미 행이 있으면 건너뛴다 — 관리자 화면에서 수정한 내용을 날리면 안 된다.

    ./seedPortfolio.sh --approach          # 비어 있을 때만
    ./seedPortfolio.sh --approach --force  # 통째로 다시 넣는다

주의: 테이블이 먼저 있어야 한다. `./migrate.sh` 를 먼저 실행할 것.
"""

import asyncio
import sys

from app.core.database.base import SessionLocal, engine
from app.module.portfolio.portfolio_repository import PortfolioRepository

# icon 값은 frontend 의 approachIcons.ts 에 정의된 키여야 한다.
# 설명은 두 문장 —
#  - 결과를 보장하는 절대 표현("어긋나지 않게", "바로 읽힌다")은 쓰지 않는다
#  - 깊게 파고들 전문용어("복구 경로", "계층 경계")보다 습관을 서술한다
#  - 예상되는 반대 질문(주석은? 확장성은? 오버엔지니어링은?)을 문장 안에서 먼저 답한다
# 노션 포트폴리오 커버의 강점 3개(연동 · 구조 · 사용자 흐름)를 앞에 두고, 성장 과정에서 드러난 원칙 3개를 뒤에 둔다.
# 이력서의 문장도 여기서 가져간다. 프론트 폴백(approach.tsx)과 같은 내용을 유지한다.
APPROACHES = [
    {
        "icon": "zap",
        "title": "실패를 전제한 외부 연동",
        "description": "OpenAI · Gemini · ElevenLabs · HeyGen · FCM 같은 AI · 음성 · 실시간 서비스를 연동해 왔습니다. 외부 서비스 하나가 장애를 일으켜도 기능이 유지되도록 폴백을 두고 설계합니다.",
    },
    {
        "icon": "layers",
        "title": "반복에서 다듬은 구조",
        "description": "같은 종류의 프로젝트를 반복하는 동안 불편했던 지점을 하나씩 고쳤습니다. 파일 하나에 모든 로직을 두던 구조는 도메인 단위 모듈로, 세션 폴링은 SSE 스트리밍으로 바꿨고, 반복되는 인증 · 로깅 · 공통 UI 는 템플릿으로 남겨 다음 프로젝트에 재사용합니다.",
    },
    {
        "icon": "cursor",
        "title": "사용자 흐름 중심의 설계",
        "description": "기능 목록이 아니라 사용자가 실제로 겪는 흐름 단위로 화면과 API 를 설계합니다. 로딩 중일 때와 오류가 났을 때 무엇이 보이고 무엇을 할 수 있는지를 정상 화면과 같은 비중으로 다룹니다.",
    },
    {
        "icon": "shield",
        "title": "AI 의 신뢰 경계",
        "description": "계산과 판정은 코드가 하고, AI 에는 설명과 정리만 맡깁니다. AI 가 만든 SQL 은 허용 목록 검사를 통과해야만 실행하고, 확정값이 필요한 질문은 별도 호출로 분리해 서버가 결정합니다.",
    },
    {
        "icon": "wrench",
        "title": "운영을 전제한 로그",
        "description": "요청마다 고유 ID 를 붙여 그 요청이 남긴 로그를 처음부터 끝까지 따라갈 수 있게 합니다. 외부 연동과 워커처럼 양이 많은 로그는 전용 파일로 나눠, 장애가 나면 한 파일만 열어 보면 되게 합니다.",
    },
    {
        "icon": "message",
        "title": "결정과 이유의 기록",
        "description": "결정과 그 이유를 기록으로 남깁니다. 문제가 생기면 현상, 원인, 조치를 정리해 공유하고, 같은 논의를 반복하지 않게 합니다.",
    },
]


async def main(force: bool) -> None:
    async with SessionLocal() as db:
        repo = PortfolioRepository(db)
        existing = await repo.list_approaches()

        if existing and not force:
            print(f"ℹ️  이미 Approach {len(existing)}건이 있어 건너뜁니다. 덮어쓰려면 --force")
            return

        saved = await repo.replace_approaches([dict(one) for one in APPROACHES])
        print(f"✅ Approach {len(saved)}건을 넣었습니다.")


async def run() -> None:
    try:
        await main("--force" in sys.argv)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run())
