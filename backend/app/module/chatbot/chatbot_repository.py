# 역할: 챗봇 설정 · 대화 기록 · 대시보드 통계 DB 쿼리

from datetime import timedelta

from sqlalchemy import case, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database.base import now_kst
from app.module.chatbot.chatbot import ChatbotMessage, ChatbotSession, ChatbotSetting

# 설정은 한 행만 쓴다
SETTING_ID = 1


class ChatbotRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_setting(self) -> ChatbotSetting | None:
        result = await self.db.execute(
            select(ChatbotSetting).where(ChatbotSetting.id == SETTING_ID)
        )
        return result.scalar_one_or_none()

    async def upsert_setting(self, fields: dict) -> ChatbotSetting:
        setting = await self.get_setting()

        if setting is None:
            setting = ChatbotSetting(id=SETTING_ID, **fields)
            self.db.add(setting)
        else:
            for key, value in fields.items():
                setattr(setting, key, value)

        await self.db.commit()
        await self.db.refresh(setting)
        return setting

    # ── 대화 기록 ───────────────────────────────────────────

    async def get_or_create_session(self, keys: dict) -> ChatbotSession:
        """session_key 로 찾고 없으면 만든다.

        ip · user_agent 는 매번 갱신한다 — 대화 중 와이파이에서 LTE 로 바뀌면
        마지막 값이 더 쓸모 있다. referrer 는 처음 것만 남긴다(유입 경로).
        """
        result = await self.db.execute(
            select(ChatbotSession).where(
                ChatbotSession.session_key == keys["session_key"]
            )
        )
        session = result.scalar_one_or_none()

        if session is None:
            session = ChatbotSession(
                session_key=keys["session_key"],
                visitor_key=keys.get("visitor_key"),
                ip=keys.get("ip"),
                user_agent=keys.get("user_agent"),
                referrer=keys.get("referrer"),
            )
            self.db.add(session)
            await self.db.flush()
            return session

        session.ip = keys.get("ip") or session.ip
        session.user_agent = keys.get("user_agent") or session.user_agent
        session.visitor_key = keys.get("visitor_key") or session.visitor_key
        return session

    async def add_message(self, keys: dict, fields: dict) -> ChatbotMessage:
        session = await self.get_or_create_session(keys)
        message = ChatbotMessage(session_id=session.id, **fields)
        self.db.add(message)

        session.message_count = (session.message_count or 0) + 1
        session.last_message_at = now_kst()

        await self.db.commit()
        return message

    async def list_sessions(self, page: int, size: int) -> tuple[list, int]:
        """최근 대화가 먼저. 목록에 첫 질문을 붙이려면 메시지가 필요하므로 함께 센다"""
        total = await self.db.scalar(select(func.count(ChatbotSession.id))) or 0
        result = await self.db.execute(
            select(ChatbotSession)
            .order_by(ChatbotSession.last_message_at.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
        return list(result.scalars().all()), total

    async def first_questions(self, session_ids: list[int]) -> dict[int, str]:
        """세션별 첫 질문. 목록에서 '무엇을 물었나' 를 한눈에 보이게 한다"""
        if not session_ids:
            return {}
        result = await self.db.execute(
            select(ChatbotMessage.session_id, ChatbotMessage.question)
            .where(ChatbotMessage.session_id.in_(session_ids))
            .order_by(ChatbotMessage.id.asc())
        )
        first: dict[int, str] = {}
        for session_id, question in result.all():
            first.setdefault(session_id, question)
        return first

    async def get_session(self, session_id: int) -> ChatbotSession | None:
        result = await self.db.execute(
            select(ChatbotSession).where(ChatbotSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def list_messages(self, session_id: int) -> list:
        result = await self.db.execute(
            select(ChatbotMessage)
            .where(ChatbotMessage.session_id == session_id)
            .order_by(ChatbotMessage.id.asc())
        )
        return list(result.scalars().all())

    # ── 통계 (대시보드) ─────────────────────────────────────

    async def stats_totals(self, start, end) -> dict:
        """기간 안의 합계. 세션은 마지막 대화 시각이 기간에 든 것을 센다.

        오늘 질문은 기간과 무관하게 늘 오늘 것을 본다 — 필터를 바꿔도
        "지금 얼마나 쓰이고 있나" 는 같은 값이어야 한다.
        """
        today = now_kst().replace(hour=0, minute=0, second=0, microsecond=0)
        in_range = (ChatbotMessage.created_at >= start) & (
            ChatbotMessage.created_at < end
        )
        row = (
            await self.db.execute(
                select(
                    func.count(ChatbotMessage.id),
                    func.avg(ChatbotMessage.latency_ms),
                    func.sum(ChatbotMessage.prompt_tokens),
                    func.sum(ChatbotMessage.output_tokens),
                    func.sum(case((ChatbotMessage.error.isnot(None), 1), else_=0)),
                ).where(in_range)
            )
        ).one()
        return {
            "sessions": await self.db.scalar(
                select(func.count(ChatbotSession.id)).where(
                    (ChatbotSession.last_message_at >= start)
                    & (ChatbotSession.last_message_at < end)
                )
            )
            or 0,
            "messages": row[0] or 0,
            "avg_latency_ms": int(row[1]) if row[1] is not None else 0,
            "prompt_tokens": int(row[2] or 0),
            "output_tokens": int(row[3] or 0),
            "errors": int(row[4] or 0),
            "today_messages": await self.db.scalar(
                select(func.count(ChatbotMessage.id)).where(
                    ChatbotMessage.created_at >= today
                )
            )
            or 0,
        }

    async def stats_daily(self, start, end) -> list[tuple]:
        """날짜별 질문 수 · 평균 응답 시간.

        주간 · 월간 묶음은 이 하루 단위 결과를 서비스에서 합친다. DB 함수로
        주/월을 자르면 MySQL 문법에 묶이고, 하루 행은 기간이 넓어도 몇백 개다.
        """
        day = func.date(ChatbotMessage.created_at)
        result = await self.db.execute(
            select(day, func.count(ChatbotMessage.id), func.avg(ChatbotMessage.latency_ms))
            .where((ChatbotMessage.created_at >= start) & (ChatbotMessage.created_at < end))
            .group_by(day)
            .order_by(day)
        )
        return list(result.all())

    async def stats_tools(self, start, end) -> list:
        """tool 사용 집계용. MySQL JSON 을 SQL 로 펼치기보다 파이썬에서 세는 편이 단순하다"""
        result = await self.db.execute(
            select(ChatbotMessage.tools).where(
                (ChatbotMessage.created_at >= start) & (ChatbotMessage.created_at < end)
            )
        )
        return [row[0] for row in result.all()]
