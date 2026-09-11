import {
  Code2,
  GitBranch,
  Layers,
  Lightbulb,
  MessageSquare,
  MousePointerClick,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Approach 카드가 쓸 수 있는 아이콘 목록.
 * DB 에는 이 키 문자열만 저장한다 — 이미지로 올리면 currentColor 를 못 써서
 * 다크모드에서 색이 따라오지 않는다.
 * 관리자 화면의 선택 목록과 공개 화면의 렌더가 이 한 곳을 공유한다.
 */
export const APPROACH_ICONS: Record<string, LucideIcon> = {
  code: Code2,
  cursor: MousePointerClick,
  wrench: Wrench,
  layers: Layers,
  branch: GitBranch,
  message: MessageSquare,
  lightbulb: Lightbulb,
  rocket: Rocket,
  shield: Shield,
  sparkles: Sparkles,
  users: Users,
  zap: Zap,
};

export const APPROACH_ICON_KEYS = Object.keys(APPROACH_ICONS);

/** 등록되지 않은 키가 와도 화면이 깨지지 않게 기본 아이콘으로 떨어진다 */
export const resolveApproachIcon = (icon: string): LucideIcon =>
  APPROACH_ICONS[icon?.toLowerCase()] ?? Sparkles;
