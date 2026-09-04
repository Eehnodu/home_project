# 역할: 업로드 파일 저장 · 읽기 · 삭제와 경로 검증. DB 에는 media/ 상대경로만 남긴다
"""업로드한 파일을 저장하고 DB 에 넣을 상대경로를 돌려준다.

DB 에는 항상 `media/...` 상대경로만 저장한다. 절대경로나 도메인을 넣지 않는다.
그래야 서버를 옮기거나 도메인이 바뀌어도 DB 를 손대지 않아도 되고,
화면에서는 앞에 API 주소만 붙이면 된다.

저장소가 갈리는 지점은 `_write` · `_read` · `_remove` 세 함수뿐이다.
지금은 홈서버라 로컬 `media/` 디렉토리만 쓰지만, 나중에 S3 같은 걸 붙일 때도
이 세 함수만 고치면 되고 호출부와 DB 는 그대로 둘 수 있다.
"""

import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile

from app.core.config.settings import settings
from app.core.utils.response import fail

# DB 에 저장되는 경로 앞머리
MEDIA_PREFIX = "media/"

# 허용 확장자 → Content-Type
CONTENT_TYPE = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
    "gif": "image/gif",
    "svg": "image/svg+xml",
}

# 업로드 1건 최대 크기
MAX_BYTES = 5 * 1024 * 1024

# 경로 한 칸은 영숫자로 시작하고 영숫자 · . · _ · - 만 허용한다.
# 막을 것을 나열하는 대신 허용할 것만 적어야 `..` 이나 제어문자가 새지 않는다.
_SEGMENT = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*")

# 프론트에서 `${id}` 가 비면 이런 문자열이 그대로 경로에 박힌다
_BAD_SEGMENT = {"null", "undefined", "NaN", "0"}


# ── 저장소 구현 (여기만 바꾸면 저장 위치가 바뀐다) ─────────────────


def _local_path(rel_path: str) -> Path:
    """`media/foo/bar.png` → MEDIA_ROOT/foo/bar.png"""
    return settings.MEDIA_ROOT / rel_path[len(MEDIA_PREFIX) :]


def _write(rel_path: str, data: bytes) -> None:
    dest = _local_path(rel_path)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)


def _read(rel_path: str) -> bytes:
    path = _local_path(rel_path)
    if not path.exists():
        fail("파일을 찾을 수 없습니다.", status_code=404)
    return path.read_bytes()


def _remove(rel_path: str) -> None:
    path = _local_path(rel_path)
    path.unlink(missing_ok=True)


# ── 검증 ────────────────────────────────────────────────────────


def _safe_subfolder(subfolder: str) -> str:
    cleaned = (subfolder or "").replace("\\", "/").strip().strip("/")
    parts = cleaned.split("/") if cleaned else []
    if not parts or not all(_SEGMENT.fullmatch(part) for part in parts):
        fail("잘못된 저장 경로입니다.", status_code=400)
    if any(part in _BAD_SEGMENT for part in parts):
        fail("저장 경로에 빈 값이 들어 있습니다.", status_code=400)
    return "/".join(parts)


def _safe_ext(filename: Optional[str]) -> str:
    ext = (Path(filename or "").suffix or "").lstrip(".").lower()
    if ext not in CONTENT_TYPE:
        allowed = ", ".join(sorted(CONTENT_TYPE))
        fail(f"허용하지 않는 파일 형식입니다. ({allowed})", status_code=400)
    return ext


def is_media_path(rel_path: Optional[str]) -> bool:
    return bool(rel_path) and rel_path.startswith(MEDIA_PREFIX)


# ── 외부에서 쓰는 함수 ───────────────────────────────────────────


def save_bytes(data: bytes, ext: str, subfolder: str) -> str:
    """바이트를 저장하고 `media/...` 상대경로를 돌려준다."""
    if not data:
        fail("빈 파일입니다.", status_code=400)
    if len(data) > MAX_BYTES:
        fail(f"파일이 너무 큽니다. (최대 {MAX_BYTES // 1024 // 1024}MB)", status_code=400)

    rel_path = f"{MEDIA_PREFIX}{_safe_subfolder(subfolder)}/{uuid.uuid4()}.{ext}"
    _write(rel_path, data)
    return rel_path


async def save_upload(upload: UploadFile, subfolder: str) -> str:
    """UploadFile 을 저장하고 `media/...` 상대경로를 돌려준다."""
    ext = _safe_ext(upload.filename)
    data = await upload.read()
    return save_bytes(data, ext, subfolder)


def read_media(rel_path: str) -> bytes:
    if not is_media_path(rel_path):
        fail("잘못된 파일 경로입니다.", status_code=400)
    return _read(rel_path)


def delete_media(rel_path: Optional[str]) -> None:
    """저장된 파일을 지운다. 경로가 비었거나 형식이 아니면 조용히 넘어간다.

    이미지를 교체할 때 이전 파일을 정리하는 용도라, 없는 파일에 예외를 던지면
    본 작업(정보 수정)이 실패해버린다.
    """
    if not is_media_path(rel_path):
        return
    _remove(rel_path)
