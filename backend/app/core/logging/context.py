# 역할: 요청 단위 ID 를 ContextVar 로 보관. 비동기 요청이 섞여도 각자 자기 값을 본다

from contextvars import ContextVar

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")


def set_request_id(request_id: str) -> None:
    request_id_var.set(request_id)


def get_request_id() -> str:
    return request_id_var.get()
