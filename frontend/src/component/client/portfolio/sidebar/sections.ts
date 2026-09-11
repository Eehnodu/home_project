// 역할: 사이드바형 한 페이지의 섹션 목록과 id 규칙. 사이드바 메뉴 · 헤더 · 본문이 같은 목록을 쓴다

import { Code, Layers, Lightbulb, User, type LucideIcon } from "lucide-react";
import type { PortfolioProject } from "@/types/portfolio";

export interface SidebarSection {
  id: string;
  title: string;
  icon: LucideIcon;
}

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  { id: "info", title: "소개", icon: User },
  { id: "stack", title: "기술 스택", icon: Layers },
  { id: "approach", title: "설계 원칙", icon: Lightbulb },
  { id: "projects", title: "프로젝트", icon: Code },
];

/** 프로젝트 섹션 id. 사이드바의 하위 메뉴도 같은 규칙을 쓴다 */
export const projectAnchor = (project: PortfolioProject) => `project-${project.id ?? project.name}`;

/** 고정 헤더(4rem) 아래로 섹션 제목이 오도록 스크롤한다. scroll-mt 와 같은 여유 */
export const scrollToSection = (id: string) => {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
};
