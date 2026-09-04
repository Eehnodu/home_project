# 역할: 포트폴리오 Info · Tech Stack · Approach · Projects 모델
from sqlalchemy import JSON, Boolean, Column, Date, DateTime, Integer, String, Text

from app.core.database.base import Base, now_kst


class PortfolioInfo(Base):
    """포트폴리오 Info 섹션. 한 사람의 소개이므로 항상 한 행만 쓴다(id=1).

    tags / links 는 순서만 의미가 있는 짧은 목록이고 항상 Info 와 함께 통째로
    읽고 쓴다. 따로 테이블을 두면 조회·수정 코드만 늘어나므로 JSON 으로 둔다.
    나중에 태그로 검색해야 할 일이 생기면 그때 테이블로 분리한다.

    - tags:  ["Backend", "Frontend", ...]
    - links: [{"label": "GitHub", "sub": "github.com/...", "href": "...", "icon": "github"}]
    - careers:      [{"org": "회사", "role": "풀스택 개발자", "period": "2025.02 ~", "items": ["...", ...]}]
    - educations:   [{"school": "학교", "major": "학부", "period": "2024.03 졸업"}]
    - certificates: [{"name": "정보처리기사", "issuer": "한국산업인력공단", "date": "2024.06"}]
    """

    __tablename__ = "tb_portfolio_info"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    # 섹션 헤더
    subtitle = Column(String(200), nullable=False, default="")

    # 프로필
    role_label = Column(String(100), nullable=False, default="")
    name = Column(String(100), nullable=False, default="")
    headline = Column(String(300), nullable=False, default="")
    description = Column(Text, nullable=False, default="")

    # media/... 상대경로. 도메인이나 절대경로를 넣지 않는다
    profile_image = Column(String(255), nullable=True)

    tags = Column(JSON, nullable=False, default=list)
    links = Column(JSON, nullable=False, default=list)

    # 공개 화면 구성. header(상단 헤더 + 한 페이지 스크롤) | sidebar(왼쪽 메뉴 + 페이지 넷)
    layout = Column(String(20), nullable=False, default="header", server_default="header")

    # 경력 · 학력 · 자격증. 항목 수가 적고 항상 Info 와 함께 읽으므로 JSON 목록으로 둔다
    careers = Column(JSON, nullable=False, default=list)
    educations = Column(JSON, nullable=False, default=list)
    certificates = Column(JSON, nullable=False, default=list)

    created_at = Column(DateTime, default=now_kst)
    updated_at = Column(DateTime, default=now_kst, onupdate=now_kst)


class PortfolioStackCategory(Base):
    """Tech Stack 섹션의 카테고리 한 줄(Frontend / Backend / ...).

    카테고리는 개수가 늘고 순서를 바꾸므로 행으로 둔다.
    반면 items 는 카테고리당 2~5개뿐이고 항상 카테고리와 함께 읽고 통째로 저장하므로
    JSON 으로 둔다 — 테이블로 쪼개면 동기화 코드만 늘어난다.

    - items: [{"name": "React", "icon_image": "media/portfolio/stack/xxx.svg"}]
    """

    __tablename__ = "tb_portfolio_stack_categories"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(50), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)
    items = Column(JSON, nullable=False, default=list)

    created_at = Column(DateTime, default=now_kst)
    updated_at = Column(DateTime, default=now_kst, onupdate=now_kst)


class PortfolioApproach(Base):
    """Approach 섹션의 카드 한 장.

    항목이 여러 개이고 순서를 바꾸므로 행으로 둔다.
    아이콘은 lucide 아이콘 이름을 문자열로 저장한다. 이미지 업로드로 두면
    currentColor 를 못 써서 다크모드에서 색이 안 따라온다.
    """

    __tablename__ = "tb_portfolio_approaches"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    icon = Column(String(50), nullable=False, default="")
    title = Column(String(100), nullable=False, default="")
    description = Column(Text, nullable=False, default="")
    sort_order = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, default=now_kst)
    updated_at = Column(DateTime, default=now_kst, onupdate=now_kst)


class PortfolioProject(Base):
    """Projects 섹션의 프로젝트 한 건.

    프로젝트는 개수가 많고(20건 이상) 개별로 추가·수정·삭제하므로 행으로 둔다.
    tech_stack / tags / integrations 와 세 절(highlights · features · improvements)은 항상 프로젝트와 함께
    읽고 통째로 저장하는 짧은 목록이라 JSON 으로 둔다. 기술명으로 프로젝트를 검색해야
    하는 요구가 생기면 그때 테이블로 뺀다.

    - kind:         "개인" | "자사" | "SI"    (구분)
    - category:     "사이드 프로젝트" | "자사 서비스" | "AI 서비스" | "챗봇" | "ERP"
    - status:       "완료" | "진행 중" | "운영 중" | "개발 중" | "지속 갱신" | "QA"
    - tech_stack:   ["FastAPI", "React", ...]
    - tags:         ["챗봇", "RAG", ...]
    - integrations: ["OpenAI", "ElevenLabs", ...]   (외부 연동)
    - highlights:   [{"title": "...", "body": "..."}, ...]  핵심 — 제목 + 1~2문장
    - features:     같은 구조                             기능
    - improvements: 같은 구조                             문제와 개선 (사이드 프로젝트는 비움)

    순서 컬럼을 두지 않는다. 목록은 start_date 내림차순(최근 작업이 위)이고,
    관리자 표는 검색·필터·페이지가 붙어 손으로 순서를 매기는 게 맞지 않는다.
    """

    __tablename__ = "tb_portfolio_projects"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    name = Column(String(100), nullable=False)
    kind = Column(String(20), nullable=False, default="")
    category = Column(String(30), nullable=False, default="")
    status = Column(String(20), nullable=False, default="")
    # 진행 중이면 end_date 가 비어 있다
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    role = Column(String(50), nullable=False, default="")
    team = Column(String(200), nullable=False, default="")

    # 카드에 보이는 한 줄 소개
    summary = Column(String(300), nullable=False, default="")
    # 모달에 보이는 상세 설명. 줄바꿈이 문단
    description = Column(Text, nullable=False, default="")

    url = Column(String(255), nullable=True)

    tech_stack = Column(JSON, nullable=False, default=list)
    tags = Column(JSON, nullable=False, default=list)
    integrations = Column(JSON, nullable=False, default=list)
    highlights = Column(JSON, nullable=False, default=list)
    features = Column(JSON, nullable=False, default=list)
    improvements = Column(JSON, nullable=False, default=list)

    # 꺼두면 공개 화면에서 빠진다. 관리자 화면에는 그대로 보인다
    visible = Column(Boolean, nullable=False, default=True, server_default="1")

    created_at = Column(DateTime, default=now_kst)
    updated_at = Column(DateTime, default=now_kst, onupdate=now_kst)
