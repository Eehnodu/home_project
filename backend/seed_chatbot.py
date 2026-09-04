"""챗봇 설정 초기 데이터 입력.

이미 행이 있으면 건너뛴다 — 관리자 화면에서 고친 지침을 날리면 안 된다.

    ./seedPortfolio.sh --chatbot          # 비어 있을 때만
    ./seedPortfolio.sh --chatbot --force  # 지침 · 인사말을 다시 넣는다

주의: 테이블이 먼저 있어야 한다. `./migrate.sh` 를 먼저 실행할 것.

모델 이름은 여기서 넣지 않는다 — 컬럼이 아니라 chatbot_service 의 상수다.
포트폴리오 데이터(프로필 · 스택 · 프로젝트)도 넣지 않는다 — 답변할 때 서버가
DB 에서 읽어 붙이므로 지침에 적어둘 필요가 없다.
"""

import asyncio
import sys

from app.core.database.base import SessionLocal, engine
from app.module.chatbot.chatbot_repository import ChatbotRepository

INSTRUCTION = """너는 개발자 Nodu 의 포트폴리오 사이트 우측 하단에 있는 안내 챗봇이다.
방문자는 대개 채용 담당자나 협업을 검토하는 개발자다.

역할:
- 프로젝트 경험, 기술 스택, 일하는 방식에 대해 답한다.
- 답은 반드시 함께 주어진 포트폴리오 내용에 근거한다. 없는 경험을 만들지 않는다.
- 포트폴리오에 없는 것을 물으면 "그건 포트폴리오에 없습니다" 라고 말하고,
  대신 확인할 수 있는 가까운 내용을 알려준다.

톤:
- 한국어 존댓말. 과장하거나 홍보하듯 말하지 않는다.
- 결론을 먼저 말하고 근거를 뒤에 붙인다.
- 기술을 왜 골랐는지 묻는 질문에는 그 프로젝트의 상황과 함께 답한다.

소개 순서:
- 프로젝트를 여럿 소개할 때는 구분을 보고 개인(사이드 프로젝트) → 자사 서비스 → SI 순서로 짚는다.
- 한 번에 전부 나열하지 않는다. 두세 건을 먼저 짚고, 더 볼지 묻는다.
- 프로젝트는 포트폴리오에 적힌 이름 그대로 부른다. 고객사 상호, 서비스 실명, 서비스 주소는
  자료에 없으므로 말하지 않고, 물으면 "공개하지 않는 정보" 라고 답한다.

다루지 않는 것:
- 연봉, 처우, 개인 연락처는 답하지 않는다. 사이트의 연락 수단을 안내한다.
- 포트폴리오와 무관한 일반 질문(코딩 대신 해주기, 잡담)은 정중히 거절한다."""

# 위젯 헤더가 이미 무엇을 답하는 챗봇인지 말한다. 인사말은 한 줄로 짧게 둔다.
GREETING = "안녕하세요. 이 포트폴리오에 대해 궁금한 점이 있으면 편하게 물어보세요."


async def main(force: bool) -> None:
    async with SessionLocal() as db:
        repo = ChatbotRepository(db)
        existing = await repo.get_setting()

        if existing and not force:
            print("ℹ️  이미 챗봇 설정이 있어 건너뜁니다. 덮어쓰려면 --force")
            return

        setting = await repo.upsert_setting(
            {
                "enabled": True,
                "instruction": INSTRUCTION,
                "greeting": GREETING,
            }
        )
        print(f"✅ 챗봇 설정을 넣었습니다. (지침 {len(setting.instruction)}자, 사용: {bool(setting.enabled)})")


async def run() -> None:
    try:
        await main("--force" in sys.argv)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run())
