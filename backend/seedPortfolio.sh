#!/bin/bash
# 포트폴리오 섹션 초기 데이터를 넣는다.
#   ./seedPortfolio.sh                    # Info
#   ./seedPortfolio.sh --approach         # Approach 6건
#   ./seedPortfolio.sh --stack            # Tech Stack
#   ./seedPortfolio.sh --projects         # Projects 10건 (시드에 없는 행은 숨김)
#   ./seedPortfolio.sh --chatbot          # 챗봇 지침 · 인사말
#   ./seedPortfolio.sh --all              # 위 전부
#   뒤에 --force 를 붙이면 기존 값을 덮어쓴다
set -e
cd "$(dirname "$0")"

# Windows 콘솔(cp949)에서 이모지·한글 출력이 깨지지 않게
export PYTHONUTF8=1

# venv 활성화 안 돼 있으면 활성화 (Linux / Windows 둘 다)
if [ -z "$VIRTUAL_ENV" ]; then
  if [ -f .venv/bin/activate ]; then
    source .venv/bin/activate
  elif [ -f .venv/Scripts/activate ]; then
    source .venv/Scripts/activate
  fi
fi

FORCE=""
TARGETS=()
for arg in "$@"; do
  case "$arg" in
    --force) FORCE="--force" ;;
    --all) TARGETS=(info approach stack projects chatbot) ;;
    --approach) TARGETS+=(approach) ;;
    --stack) TARGETS+=(stack) ;;
    --projects) TARGETS+=(projects) ;;
    --chatbot) TARGETS+=(chatbot) ;;
    --info) TARGETS+=(info) ;;
    *) echo "❌ 알 수 없는 옵션: $arg"; exit 1 ;;
  esac
done
[ ${#TARGETS[@]} -eq 0 ] && TARGETS=(info)

for target in "${TARGETS[@]}"; do
  case "$target" in
    info) python seed_portfolio.py $FORCE ;;
    approach) python seed_approach.py $FORCE ;;
    stack) python seed_stack.py $FORCE ;;
    projects) python seed_projects.py $FORCE ;;
    chatbot) python seed_chatbot.py $FORCE ;;
  esac
done
