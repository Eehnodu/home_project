# 역할: 모듈별 로거를 얻는 얇은 헬퍼

import logging


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
