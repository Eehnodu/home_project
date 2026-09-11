/** 집계 단위 */
export type StatsUnit = "day" | "week" | "month";

/** 대시보드 집계 — 관리자 /api/chatbot/stats 응답 */
export interface DashboardStats {
  /** 서버가 실제로 적용한 기간과 단위 (잘못된 값은 기본값으로 되돌아온다) */
  range: { from: string; to: string; unit: StatsUnit };
  totals: {
    /** 대화 묶음 수 (세션) */
    sessions: number;
    /** 질문 수 */
    messages: number;
    today_messages: number;
    avg_latency_ms: number;
    prompt_tokens: number;
    output_tokens: number;
    /** 질문 하나당 평균 입력 토큰 — 컨텍스트를 얼마나 먹는지 */
    avg_prompt_tokens: number;
    errors: number;
    projects: number;
    hidden_projects: number;
  };
  /**
   * 단위별 칸. 데이터가 없는 칸도 0 으로 채워 온다.
   * label 은 그 칸의 시작 날짜 — 일간은 그 날, 주간은 월요일, 월간은 1일.
   */
  series: { label: string; questions: number; avg_latency_ms: number }[];
  /** 함수별 호출 횟수. 함수를 안 쓴 질문은 "미사용" 으로 함께 온다 */
  tools: { name: string; count: number }[];
  /** 카테고리별 프로젝트 수 */
  categories: { name: string; count: number }[];
}
