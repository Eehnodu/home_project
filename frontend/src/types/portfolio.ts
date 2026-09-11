/** 포트폴리오 Info 섹션 — 백엔드 /api/portfolio/info 응답 */
export interface PortfolioLink {
  label: string;
  sub: string;
  href: string;
  /** 업로드한 아이콘의 `media/...` 상대경로 */
  icon_image: string | null;
}

/** 공개 화면 구성. header = 상단 헤더 + 한 페이지 스크롤, sidebar = 왼쪽 메뉴 + 페이지 넷 */
export type PortfolioLayoutType = "header" | "sidebar";

export interface PortfolioCareer {
  org: string;
  role: string;
  period: string;
  /** 한 줄에 하나 */
  items: string[];
}

export interface PortfolioEducation {
  school: string;
  major: string;
  period: string;
}

export interface PortfolioCertificate {
  name: string;
  issuer: string;
  date: string;
}

export interface PortfolioInfo {
  subtitle: string;
  role_label: string;
  name: string;
  /** 줄바꿈으로 여러 줄 */
  headline: string;
  /** 줄바꿈으로 여러 문단 */
  description: string;
  /** `media/...` 상대경로. 없으면 null */
  profile_image: string | null;
  tags: string[];
  links: PortfolioLink[];
  /** 경력 · 학력 · 자격증. 비어 있으면 그 칸은 그리지 않는다 */
  careers: PortfolioCareer[];
  educations: PortfolioEducation[];
  certificates: PortfolioCertificate[];
  layout: PortfolioLayoutType;
}

/** Tech Stack — 카테고리 한 줄 */
export interface StackItem {
  name: string;
  /** 업로드한 아이콘의 `media/...` 상대경로 */
  icon_image: string | null;
}

export interface StackCategory {
  /** 새로 추가한 카테고리는 없다 */
  id?: number;
  name: string;
  items: StackItem[];
}

/** Approach — 카드 한 장. icon 은 lucide 아이콘 이름 */
export interface ApproachCard {
  id?: number;
  icon: string;
  title: string;
  description: string;
}

/** Projects — 프로젝트 한 건. 백엔드 /api/portfolio/project 응답 */
/** 핵심 · 기능 · 문제와 개선의 한 항목 */
export interface ProjectPoint {
  title: string;
  body: string;
}

export interface PortfolioProject {
  /** 새로 추가하는 항목은 아직 없다 */
  id?: number;
  name: string;
  /** "자사" | "SI" */
  kind: string;
  /** "챗봇" | "AI 생성" | "웹/모바일" | "ERP" | "자사 서비스" */
  category: string;
  /** "완료" | "진행 중" | "QA" | "폐기" */
  status: string;
  /** YYYY-MM-DD. 없으면 null */
  start_date: string | null;
  /** YYYY-MM-DD. 진행 중이면 null */
  end_date: string | null;
  role: string;
  team: string;
  /** 카드에 보이는 한 줄 소개 */
  summary: string;
  /** 모달 상세. 줄바꿈 하나가 문단 하나 */
  description: string;
  url: string | null;
  tech_stack: string[];
  tags: string[];
  /** 외부 연동 */
  integrations: string[];
  /** 핵심 — 제목 + 1~2문장 */
  highlights: ProjectPoint[];
  /** 기능 */
  features: ProjectPoint[];
  /** 문제와 개선. 사이드 프로젝트는 비어 있다 */
  improvements: ProjectPoint[];
  /** 꺼두면 공개 화면에서 빠진다 */
  visible: boolean;
}
