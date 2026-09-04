# 역할: Redis 접근 래퍼 — 캐시 · 카운터(호출 제한) · 락. 짧은 타임아웃으로 장애 시 빨리 포기한다
import redis.asyncio as redis
from redis.backoff import NoBackoff
from redis.retry import Retry
from app.core.config.settings import settings
from typing import Optional

# Redis 연결·읽기 타임아웃(초). 짧게 둔다 — 이 서비스는 캐시와 카운터용이고,
# 못 붙었을 때 기다리는 시간이 그대로 사용자 응답 지연이 된다.
REDIS_TIMEOUT = 0.5


class RedisService:
    """
    Redis 접근을 단순화하기 위한 공통 서비스 클래스
    - Redis를 DB처럼 쓰지 않고
    - 캐시 / 상태 관리 / 동시성 제어 용도로만 사용
    """

    def __init__(
        self, host: str = None, port: int = None, password: Optional[str] = None
    ):
        self._host = host or settings.redis_host
        self._port = port or settings.redis_port
        # 운영 Redis 는 비밀번호가 걸려 있다. 비어 있으면 안 붙인다
        self._password = password or settings.redis_password or None
        self._client: Optional[redis.Redis] = None

    @property
    def client(self) -> redis.Redis:
        if not self._client:
            self._client = redis.Redis(
                host=self._host,
                port=self._port,
                password=self._password,
                decode_responses=True,
                # Redis 가 죽었을 때 얼마나 기다리는지 실측(로컬, 연결 거부):
                #   기본값          20.6초  ← 챗봇 응답이 그만큼 붙잡혔다
                #   타임아웃 0.5초  13.8초  ← redis-py 7 이 기본으로 여러 번 재시도한다
                #   + 재시도 끔      0.5초
                # 캐시·카운터용이라 못 붙으면 빨리 포기하고 넘어가는 편이 맞다.
                socket_connect_timeout=REDIS_TIMEOUT,
                socket_timeout=REDIS_TIMEOUT,
                retry=Retry(NoBackoff(), 0),
            )
        return self._client

    # =====================================================
    # Key - Value (String)
    # =====================================================
    # 단일 값 + TTL이 필요한 경우 사용
    #
    # 사용 예:
    # - 인증 코드 / OTP
    # - 토큰
    # - 외부 API 응답 캐시
    # - 임시 플래그
    # =====================================================

    async def set(self, key: str, value: str, expire: int = 300):
        """
        key에 value 저장 + TTL 설정

        expire:
        - 초 단위 TTL
        - 기본값 300초 (5분)
        """
        await self.client.set(key, value, ex=expire)

    async def get(self, key: str):
        """
        key에 저장된 값 조회
        """
        return await self.client.get(key)

    async def delete(self, key: str):
        """
        key 삭제
        """
        await self.client.delete(key)

    async def incr(self, key: str, expire: int = 60) -> int:
        """
        key를 1 증가시키고 증가 후 값 반환

        호출 횟수 제한(rate limit)용

        expire:
        - 처음 만들어질 때만 TTL을 건다
        - 매번 걸면 창이 계속 밀려 제한이 안 풀린다
        """
        value = await self.client.incr(key)
        if value == 1:
            await self.client.expire(key, expire)
        return value

    async def exists(self, key: str):
        """
        key 존재 여부 확인

        반환:
        - 1: 존재
        - 0: 없음
        """
        return await self.client.exists(key)

    # =====================================================
    # Hash
    # =====================================================
    # 하나의 엔티티에 속한 여러 필드를 묶어서 관리할 때 사용
    #
    # 사용 예:
    # - 유저 상태 캐시
    # - 세션 메타데이터
    # - 작업 상태(progress, status 등)
    #
    # 특징:
    # - 부분 업데이트 가능
    # - 동시성에 비교적 안전
    # =====================================================

    async def hset(self, name: str, mapping: dict):
        """
        Hash에 여러 field/value 저장

        예:
        name = "user:123"
        mapping = {"status": "active", "last_seen": "2024-01-01"}
        """
        await self.client.hset(name, mapping=mapping)

    async def hgetall(self, name: str):
        """
        Hash에 저장된 모든 field/value 조회
        """
        return await self.client.hgetall(name)

    async def hget(self, name: str, field: str):
        """
        Hash의 특정 field 값 조회
        """
        return await self.client.hget(name, field)

    # =====================================================
    # Set
    # =====================================================
    # 중복 없는 집합(상태/소속/처리 여부)을 관리할 때 사용
    #
    # 사용 예:
    # - 온라인 유저 목록
    # - 처리 중인 작업 목록
    # - feature flag 대상
    # - 이미 처리한 ID 기록 (멱등성)
    #
    # 특징:
    # - 중복 자동 제거
    # - add / remove가 안전 (여러 번 호출해도 문제 없음)
    # =====================================================

    async def sadd(self, name: str, member):
        """
        Set에 멤버 추가

        이미 존재하는 경우:
        - 중복 추가되지 않음
        """
        await self.client.sadd(name, member)

    async def srem(self, name: str, member):
        """
        Set에서 멤버 제거

        멤버가 없어도:
        - 에러 없이 그냥 통과
        - finally 블록에서 쓰기 좋음
        """
        await self.client.srem(name, member)

    async def smembers(self, name: str):
        """
        Set에 포함된 모든 멤버 조회

        주의:
        - 멤버 수가 많을 경우 사용 주의
        - 운영/디버깅/소규모 집합용
        """
        return await self.client.smembers(name)

    # =====================================================
    # Lock
    # =====================================================
    # 여러 요청/서버 환경에서
    # "동시에 하나만 실행돼야 하는 코드" 보호용
    #
    # 사용 예:
    # - 중복 실행되면 안 되는 초기화 로직
    # - cache miss 시 단일 채우기
    # =====================================================

    async def lock(self, name: str, timeout: int = 10):
        """
        Redis 기반 분산 락 획득

        주의:
        - 호출한 쪽에서 반드시 release 필요
        - try/finally 패턴 권장

        timeout:
        - 락 유지 시간 (초)
        """
        lock = await self.client.lock(name, timeout=timeout)
        await lock.acquire()
        return lock
