# 역할: 챗봇 설정 · 대화 세션 · 메시지 기록 모델
from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String, Text

from app.core.database.base import Base, now_kst


class ChatbotSetting(Base):
    """포트폴리오 우측 하단 챗봇 설정. 챗봇은 하나라 항상 한 행만 쓴다(id=1).

    모델은 컬럼으로 두지 않는다 — 한도(무료 티어)와 비용을 보고 코드에서 고정하며,
    바꾸는 일은 배포와 함께 일어난다. 관리자 화면에는 표시만 한다.
    """

    __tablename__ = "tb_chatbot_settings"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    # 꺼두면 공개 화면에서 위젯이 사라진다
    enabled = Column(Boolean, nullable=False, default=True, server_default="1")

    # 시스템 프롬프트. 답변 톤 · 범위 · 금지사항을 여기에 적는다
    instruction = Column(Text, nullable=False, default="")

    # 위젯을 열었을 때 먼저 보이는 인사말
    greeting = Column(String(300), nullable=False, default="")

    created_at = Column(DateTime, default=now_kst)
    updated_at = Column(DateTime, default=now_kst, onupdate=now_kst)


class ChatbotSession(Base):
    """대화 한 묶음. 로그인이 없어 세 가지를 함께 저장한다.

    - session_key : 위젯이 만든 UUID (sessionStorage). 새로고침은 견디고 탭을
      닫으면 끝난다. 사람이 "대화 한 판" 이라고 느끼는 단위와 맞다.
    - visitor_key : 위젯이 만든 UUID (localStorage). 같은 브라우저의 재방문을 잇는다.
    - ip / user_agent : 서버가 붙인다. 위 두 값은 시크릿 모드나 저장소 차단에서
      매번 새로 생기므로, 그때 남는 유일한 단서다.

    하나만으로는 부족하다 — IP 는 통신사 NAT · 공용 와이파이에서 여러 사람이
    뭉치고, 한 사람이 집에서 LTE 로 옮기면 갈라진다.
    """

    __tablename__ = "tb_chatbot_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    session_key = Column(String(64), nullable=False, unique=True, index=True)
    visitor_key = Column(String(64), nullable=True, index=True)

    ip = Column(String(45), nullable=True)  # IPv6 까지 들어간다
    user_agent = Column(String(500), nullable=True)
    referrer = Column(String(500), nullable=True)  # 어디서 들어왔는지

    message_count = Column(Integer, nullable=False, default=0, server_default="0")
    started_at = Column(DateTime, default=now_kst)
    last_message_at = Column(DateTime, default=now_kst, index=True)


class ChatbotMessage(Base):
    """질문 한 번과 그 답. 실패한 질문도 남긴다 — 무엇을 못 답했는지가 제일 값지다.

    tools 에는 그 질문에서 모델이 부른 함수와 인자를 남긴다. "이 질문에 검색이
    걸렸나 · 어떤 검색어로 걸렸나" 를 보면 컨텍스트를 어떻게 고칠지 근거가 된다.
    """

    __tablename__ = "tb_chatbot_messages"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    session_id = Column(Integer, nullable=False, index=True)

    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)  # 실패하면 비고 error 가 찬다
    tools = Column(JSON, nullable=True)

    # Gemini 가 알려주는 토큰 사용량. tool 왕복이 있으면 호출마다 합산한 값이다
    prompt_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)

    latency_ms = Column(Integer, nullable=True)
    error = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=now_kst, index=True)
