# home_project — 포트폴리오 사이트

프로필 · 기술 스택 · 개발 방식 · 프로젝트를 보여주는 포트폴리오 사이트와, 그 내용을 편집하는 관리자 화면,
방문자가 포트폴리오에 대해 물어볼 수 있는 AI 챗봇을 한 저장소에 담았습니다.
홈서버에 배포해 운영합니다.

## 무엇을 하는가

**포트폴리오 (`/`, `/projects`)**

- Info · Tech Stack · Approach · Projects 네 섹션을 전부 DB 에서 읽습니다. 글을 고칠 때 코드를 배포하지 않아도 되게 하기 위해서입니다.
- 프로젝트 목록은 카테고리로 거를 수 있습니다. 사이트 링크를 공유하면 썸네일이 보이도록 og:image 를 넣었습니다.

**관리자 (`/admin`)**

- Google 로그인(허용 계정 1개) 후 각 섹션을 폼으로 편집합니다. 이미지는 서버 media 폴더에 저장합니다.
- 챗봇 지침 · 인사말을 바꾸고, 대화 기록과 통계 대시보드(일자별 질문 수 · 함수 사용 · 카테고리 · 평균 응답 시간)를 봅니다.

**AI 챗봇**

- Google Gemini 가 답합니다. 매 질문에 프로필 · 스택 · 프로젝트 요약을 컨텍스트로 넣되, 질문과 관련 있는 것만 골라 넣어 토큰을 줄였습니다.
- 요약에서 잘린 나머지는 function calling 으로 모델이 직접 조회합니다. 처음부터 다 넣으면 매 질문이 무거워지기 때문입니다.
- 답변은 스트리밍으로 흘려보내 타이핑처럼 보이게 했습니다. nginx 가 버퍼링하지 않도록 응답 헤더로 알립니다.
- 세션별 대화 기록과 입력 · 출력 토큰 수를 저장하고 어드민에서 확인합니다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite, react-router-dom v7, TanStack Query v5, Tailwind CSS v3 (다크모드), recharts |
| Backend | FastAPI + SQLAlchemy 2.0 (async), MySQL (aiomysql), Redis, Alembic |
| 인증 | Google OAuth + JWT (Argon2), 관리자 전용 |
| AI | Google Gemini (function calling · 스트리밍) |
| 배포 | 홈서버, nginx 리버스 프록시 |

## 폴더 구조

```
backend/
├── app/module/
│   ├── portfolio/   Info · Stack · Approach · Projects CRUD
│   ├── chatbot/     세션 · 메시지 · 지침 · 통계
│   ├── auth/ user/ admin/ web_socket/
│   └── infra/       gemini · google · redis
├── seed_*.py        섹션별 초기 데이터
├── seedPortfolio.sh 시드 실행 (--approach / --stack / --projects / --chatbot / --all, --force)
├── migrate.sh       alembic upgrade + autogenerate
└── run.sh           uvicorn :8000

frontend/src/container/
├── client/portfolio/   메인 · 프로젝트 목록
├── client/cs/          챗봇 위젯
└── admin/              portfolio(info · techstack · approach · project) · chatbot(setting · log · stats)
```

## 실행

```bash
# backend
cd backend
python -m venv .venv && source .venv/Scripts/activate
pip install -r requirements.txt
./migrate.sh
./insertAdmin.sh
./seedPortfolio.sh --all
./run.sh

# frontend
cd frontend
npm install
npm run dev
```

## 배포

홈서버(라즈베리파이 · Linux)에서 운영합니다.

- 프론트는 로컬에서 `npm run build` 한 산출물을 서버에 올리고 nginx 가 정적 파일로 서빙합니다. 서버에서는 빌드하지 않습니다.
- 백엔드는 uvicorn 을 systemd 서비스로 상시 실행하고, nginx 가 `/api` 요청을 리버스 프록시합니다. 챗봇 스트리밍 응답은 프록시 버퍼링을 끄도록 응답 헤더로 지정합니다.
- MySQL · Redis 는 같은 서버에서 동작합니다. 서버 호스트명으로 prod 환경을 판별해 `prod_*` 설정을 읽습니다.
- 업로드 이미지는 `backend/media/` 에 저장되고 nginx 가 그대로 서빙합니다.

## 환경변수

`backend/.env.example` 과 `frontend/.env.example` 을 각각 `.env` 로 복사해 채웁니다. 실제 `.env` 는 커밋되지 않습니다.

| 파일 | 내용 |
| --- | --- |
| `backend/.env` | MySQL · Redis 접속 정보(local / prod), JWT 시크릿, Gemini 키, Google OAuth 클라이언트, 관리자 로그인을 허용할 Google 계정(`admin_email`) |
| `frontend/.env` | API 주소, Google 클라이언트 ID, OAuth 리다이렉트 주소 |

서버 호스트명이 `homeserver` 이면 prod, 아니면 local 값을 읽습니다.
