# 역할: 라우터 함수에 ServiceProvider 를 자동 주입하는 데코레이터

from fastapi import Depends

from app.core.provider.http.service import ServiceProvider, get_provider


def with_provider(func):
    """라우터에 Depends(get_provider)를 자동 주입하는 데코레이터"""
    # wrapper 의 시그니처가 p 하나뿐이라 FastAPI 는 이것만 의존성으로 해석한다.
    # 그래서 라우터는 경로 변수 대신 쿼리 · body 로 값을 받고, 원본 함수는 p 를 통해 꺼낸다
    async def wrapper(p: ServiceProvider = Depends(get_provider)):
        return await func(p)
    return wrapper