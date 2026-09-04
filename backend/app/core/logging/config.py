# 역할: 루트 로거 설정 — 모든 로그 줄에 요청 ID 를 붙인다

import logging

from app.core.logging.context import get_request_id

LOG_FORMAT = "[%(asctime)s] [%(levelname)s] [req:%(request_id)s] [%(name)s] %(message)s"


# 포맷의 %(request_id)s 를 채운다. 요청 밖(기동 시점 등)에서는 "-"
class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = get_request_id()
        return True


def setup_logging() -> None:
    formatter = logging.Formatter(LOG_FORMAT)

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    handler.addFilter(RequestIdFilter())

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers.clear()
    root_logger.addHandler(handler)

    # uvicorn 은 자기 핸들러를 따로 둔다. 그대로 두면 형식이 갈리고 요청 ID 가 빠지므로
    # 핸들러를 비우고 루트로 흘려보낸다
    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(logger_name)
        logger.handlers.clear()
        logger.propagate = True
