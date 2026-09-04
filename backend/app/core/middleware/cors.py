# 역할: CORS 설정을 FastAPI 애플리케이션에 적용하는 모듈

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# FastAPI 앱에 CORS 설정 미들웨어를 추가
def setup_cors(app: FastAPI):
    # 로컬 개발 주소와 운영 도메인만 허용한다. 쿠키로 인증하므로(allow_credentials)
    # 와일드카드(*)는 브라우저가 거부한다 — 출처를 하나씩 적어야 한다
    origins = ["http://localhost:3000", "http://127.0.0.1:3000", "https://noduu.duckdns.org"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
