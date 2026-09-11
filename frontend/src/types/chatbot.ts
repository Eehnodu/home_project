/** 챗봇 설정 — 관리자 /api/chatbot/setting 응답 */
export interface ChatbotSetting {
  /** 코드에서 고정한 모델 이름. 표시만 한다 */
  model: string;
  /** 꺼두면 공개 위젯이 사라진다 */
  enabled: boolean;
  /** 시스템 프롬프트 */
  instruction: string;
  /** 위젯을 열었을 때 먼저 보이는 인사말 */
  greeting: string;
}

/** 공개 위젯이 쓰는 값 — /api/chatbot/config 응답. 지침은 내려오지 않는다 */
export type ChatbotConfig = Pick<ChatbotSetting, "enabled" | "greeting">;

/** 위젯 → 서버. 지침·포트폴리오 컨텍스트는 서버가 붙이므로 보내지 않는다 */
export interface ChatbotMessageRequest {
  /** 방문자 질문 */
  message: string;
  /** 이전 대화. 서버가 뒤에서 몇 개만 잘라서 쓴다 */
  history: { role: "user" | "assistant"; text: string }[];
  /** 대화 한 묶음(sessionStorage). 저장소가 막혀 있으면 없이 보낸다 */
  session_key?: string;
  /** 같은 브라우저의 재방문(localStorage) */
  visitor_key?: string;
}

/** 서버 → 위젯 */
export interface ChatbotMessageResponse {
  reply: string;
}

/** 관리자 대화 기록 — 목록 한 줄 */
export interface ChatbotLogSession {
  id: number;
  session_key: string;
  visitor_key: string | null;
  ip: string | null;
  user_agent: string | null;
  referrer: string | null;
  message_count: number;
  /** 목록에서 무엇을 물었는지 바로 보이게 하는 첫 질문 */
  first_question: string;
  started_at: string | null;
  last_message_at: string | null;
}

export interface ChatbotLogList {
  total: number;
  page: number;
  size: number;
  items: ChatbotLogSession[];
}

/** 대화 전문의 한 턴. 실패한 질문도 남으므로 answer 가 비고 error 가 찰 수 있다 */
export interface ChatbotLogMessage {
  id: number;
  question: string;
  answer: string;
  /** 그 질문에서 모델이 부른 함수와 인자 */
  tools: { name: string; args: Record<string, unknown>; matched?: number | null }[];
  /** Gemini 가 알려준 토큰 사용량. tool 왕복이 있으면 호출을 합산한 값 */
  prompt_tokens: number | null;
  output_tokens: number | null;
  latency_ms: number | null;
  error: string | null;
  created_at: string | null;
}

export interface ChatbotLogDetail {
  session: ChatbotLogSession;
  messages: ChatbotLogMessage[];
}
