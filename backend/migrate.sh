#!/bin/bash
# 모델 변경분을 리비전으로 만들고 DB 에 적용한다.
#   ./migrate.sh                 # 메시지 없이 (update)
#   ./migrate.sh "add portfolio" # 메시지 지정
set -e
cd "$(dirname "$0")"

# Windows 콘솔(cp949)에서 이모지·한글 출력이 깨지지 않게
export PYTHONUTF8=1

# venv 활성화 안 돼 있으면 활성화 (Linux / Windows 둘 다)
if ! command -v alembic &> /dev/null; then
  if [ -f .venv/bin/activate ]; then
    source .venv/bin/activate
  elif [ -f .venv/Scripts/activate ]; then
    source .venv/Scripts/activate
  else
    echo "❌ alembic 을 찾을 수 없고 .venv 도 없습니다."
    exit 1
  fi
fi

MSG="${1:-update}"

# 1) head 가 여러 개면 먼저 병합 — 갈라진 채로 두면 upgrade 가 거부된다
HEAD_COUNT=$(alembic heads 2>/dev/null | grep -c "(head)" || true)
if [ "$HEAD_COUNT" -gt 1 ]; then
  echo "⚠️  head 가 ${HEAD_COUNT}개로 갈라져 있어 병합 리비전을 만듭니다."
  alembic merge heads -m "merge heads"
fi

# 2) DB 를 먼저 최신으로 — 뒤처진 상태에서 autogenerate 하면 잘못된 diff 가 나온다
alembic upgrade head

# 3) 모델 변경분으로 리비전 생성
alembic revision --autogenerate -m "$MSG"

# 4) 변경이 없어 빈 리비전이 생겼으면 지운다
LATEST=$(ls -t alembic/versions/*.py 2>/dev/null | head -1)
if [ -z "$LATEST" ]; then
  echo "ℹ️  생성된 리비전이 없습니다."
  exit 0
fi

if python - "$LATEST" <<'PYEOF'
import re
import sys

src = open(sys.argv[1], encoding="utf-8").read()


def body_is_empty(name: str) -> bool:
    found = re.search(rf"def {name}\(\).*?:\n(.*?)(?=\ndef |\Z)", src, re.S)
    body = found.group(1) if found else ""
    # 최신 alembic 템플릿은 함수 첫 줄에 docstring("""Upgrade schema.""")을 넣는다.
    # 주석과 docstring 을 걷어낸 뒤 pass 만 남는지 본다.
    lines = [
        line.strip()
        for line in body.splitlines()
        if line.strip()
        and not line.strip().startswith("#")
        and not line.strip().startswith(('"""', "'''"))
    ]
    return lines == ["pass"]


sys.exit(0 if body_is_empty("upgrade") and body_is_empty("downgrade") else 1)
PYEOF
then
  echo "ℹ️  모델 변경이 없어 빈 리비전을 삭제합니다: $LATEST"
  rm "$LATEST"
else
  # 5) 적용
  alembic upgrade head
  echo "✅ 마이그레이션 완료: $LATEST"
fi
