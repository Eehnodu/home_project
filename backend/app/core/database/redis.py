# 역할: 환경변수만으로 만드는 기본 Redis 클라이언트. 앱 로직은 infra/redis/redis_service.py 를 쓴다

import os

import redis.asyncio as redis

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))

SESSION_TTL = int(os.getenv("SESSION_TTL", "3600")) 

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    decode_responses=True,
)