// 역할: 클라이언트(CS) 사이드바 · 헤더 타입과 경로 → 헤더 정보 해석기

import { LucideIcon } from "lucide-react";

interface BaseLinkItem {
  label: string;
  to: string;
  icon?: LucideIcon;
  number?: number;
  end?: boolean;
  subPathActive?: boolean;
}

interface ClientLinkItem extends BaseLinkItem {
  type: "link";
}

interface ClientGroupItem {
  type: "group";
  title: string;
  icon?: LucideIcon;
  children: BaseLinkItem[];
  service?: string;
}

export type ClientMenuItem = ClientLinkItem | ClientGroupItem;

export interface SubLinkProps extends BaseLinkItem {
  nested?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

interface GroupItemProps {
  title: string;
  children: BaseLinkItem[];
  icon?: LucideIcon;
}

export interface GroupProps {
  item: GroupItemProps;
  collapsed?: boolean;
}

// ======================================
// 페이지 별 Props
export interface ClientSidebarProps {
  collapsed: boolean;
  clientMenu: ClientMenuItem[];
  onToggleSidebar: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/** 헤더용: 서브 경로별로 메뉴에서 채움 */
export interface ClientRouteHeaderEntry {
  label: string;
  /** 리프(서브링크) 아이콘 — 있으면 헤더 최우선 */
  subIcon?: LucideIcon | null;
  /** 그룹 아이콘 — sub 없을 때 */
  groupIcon?: LucideIcon | null;
  /** true면 로고 이미지 */
  useLogo?: boolean;
}

export type ClientHeaderResolved =
  | { label: string; kind: "lucide"; Icon: LucideIcon }
  | { label: string; kind: "logo" };

export function buildRouteConfig(menu: ClientMenuItem[]): Record<string, ClientRouteHeaderEntry> {
  return menu.reduce(
    (acc, item) => {
      if (item.type === "link") {
        acc[item.to] = { label: item.label, subIcon: item.icon ?? null, groupIcon: null };
      } else {
        item.children.forEach((child) => {
          acc[child.to] = {
            label: child.label,
            subIcon: child.icon ?? null,
            groupIcon: item.icon ?? null,
          };
        });
      }
      return acc;
    },
    {} as Record<string, ClientRouteHeaderEntry>,
  );
}

export function createHeaderResolver(
  routeConfig: Record<string, ClientRouteHeaderEntry>,
  fallback: ClientRouteHeaderEntry,
) {
  return (pathname: string): ClientHeaderResolved => {
    const key = Object.keys(routeConfig)
      .sort((a, b) => b.length - a.length)
      .find((k) => pathname === k || pathname.startsWith(k + "/"));
    return resolveClientHeaderIcon(key ? routeConfig[key]! : fallback);
  };
}

export function resolveClientHeaderIcon(
  entry: ClientRouteHeaderEntry,
): ClientHeaderResolved {
  if (entry.useLogo) return { label: entry.label, kind: "logo" };
  if (entry.subIcon)
    return { label: entry.label, kind: "lucide", Icon: entry.subIcon };
  if (entry.groupIcon)
    return { label: entry.label, kind: "lucide", Icon: entry.groupIcon };
  return { label: entry.label, kind: "logo" };
}

export interface ClientHeaderProps {
  getHeaderInfoByPath: (path: string) => ClientHeaderResolved;
  onMobileMenuClick?: () => void;
}
