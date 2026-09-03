#!/bin/bash
# 초기 관리자 계정을 넣는다. 이미 id=1 이 있으면 아무것도 하지 않는다.
set -e
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "❌ .env 파일이 없습니다."
  exit 1
fi

# mysql 클라이언트가 PATH 에 없으면 흔한 설치 경로를 훑는다
if ! command -v mysql &> /dev/null; then
  for candidate in \
    /usr/bin/mysql \
    /usr/local/mysql/bin \
    "/c/Program Files/MySQL/MySQL Server 8.0/bin"
  do
    if [ -x "$candidate" ] || [ -x "$candidate/mysql" ]; then
      export PATH="$PATH:$(dirname "$candidate")"
      break
    fi
  done
fi

if ! command -v mysql &> /dev/null; then
  echo "❌ mysql 클라이언트를 찾을 수 없습니다."
  exit 1
fi

# MySQL 관련 변수만 로드
while IFS='=' read -r key value; do
  value="${value%$'\r'}"   # CRLF 줄바꿈 대응
  case "$key" in
    local_mysql_*)
      export "$key=$value"
      ;;
  esac
done < .env

for required in local_mysql_host local_mysql_user local_mysql_password local_mysql_db; do
  if [ -z "${!required}" ]; then
    echo "❌ .env 에 $required 가 없습니다."
    exit 1
  fi
done

# 비밀번호를 명령줄에 노출하지 않도록 임시 설정 파일로 넘긴다.
# `-p<password>` 는 ps 목록에 그대로 찍힌다.
CONFIG_FILE=$(mktemp)
trap 'rm -f "$CONFIG_FILE"' EXIT
chmod 600 "$CONFIG_FILE"
cat > "$CONFIG_FILE" <<CONF
[client]
host=${local_mysql_host}
user=${local_mysql_user}
password=${local_mysql_password}
CONF

# 따옴표로 감싼 heredoc — argon2 해시의 $ 가 셸에서 치환되면 안 된다
mysql --defaults-extra-file="$CONFIG_FILE" "$local_mysql_db" <<'SQL'
INSERT INTO tb_admins (id, email, password, created_at)
SELECT 1, '1',
       '$argon2id$v=19$m=65536,t=3,p=4$HGMMIURIaU1J6T0nJMTYuw$1dbpr6QsMQcpquaD+Ewd/AsLrtxgYBvlKMOK4R+f8Nc',
       '2025-11-03 09:12:59'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM tb_admins WHERE id = 1
);
SQL

echo "✅ 관리자 계정 확인 완료 (없으면 생성)"
