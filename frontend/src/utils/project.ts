// 역할: 공개 화면의 프로젝트 순서와 구분 배지. 자사 → 수주 → 사이드 순으로 두고, 같은 구분 안에서는 최근 시작순

import type { PortfolioProject } from "@/types/portfolio";

/* DB 의 kind 값 → 화면에 보이는 배지 이름과 순서 */
const KIND_ORDER: Record<string, { label: string; rank: number }> = {
  자사: { label: "자사", rank: 0 },
  SI: { label: "수주", rank: 1 },
  개인: { label: "사이드", rank: 2 },
};

export const kindLabel = (kind: string) => KIND_ORDER[kind]?.label ?? kind;

/**
 * 서버는 시작일 최근순으로 준다. 보여줄 때는 구분을 먼저 묶는다.
 * 운영 중인 자사 서비스가 먼저 보이고, 개인 작업은 뒤로 간다.
 */
export const sortProjects = (projects: PortfolioProject[]) =>
  [...projects].sort((a, b) => {
    const rankA = KIND_ORDER[a.kind]?.rank ?? 9;
    const rankB = KIND_ORDER[b.kind]?.rank ?? 9;
    if (rankA !== rankB) return rankA - rankB;
    return (b.start_date ?? "").localeCompare(a.start_date ?? "");
  });

/** 01. 02. … 처럼 두 자리 번호 */
export const projectNumber = (index: number) => `${String(index + 1).padStart(2, "0")}.`;
