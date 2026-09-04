# 역할: FastAPI 앱에 모든 공통 미들웨어(CORS, 보안 등)를 일괄 등록

from fastapi import FastAPI

from .cors import setup_cors
from .security import setup_security
from .request_id import setup_request_id


# CORS · 보안 헤더 · 요청 ID 미들웨어를 한 곳에서 등록. 마지막에 등록한 것이 가장 바깥에서 실행된다
def setup_middlewares(app: FastAPI):
    setup_cors(app)
    setup_security(app)
    setup_request_id(app)
