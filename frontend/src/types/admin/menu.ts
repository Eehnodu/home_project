// 역할: 관리자 메뉴 정의와 경로 → 헤더 제목/아이콘 매핑

import {
  ChartColumnIcon,
  LucideIcon,
  User,
  Briefcase,
  Layers,
  Lightbulb,
  FolderKanban,
  Bot,
  MessageSquareText,
  History,
} from "lucide-react";
import { AdminMenuItem } from "./sidebar";

export const adminMenu: AdminMenuItem[] = [
  {
    type: "group",
    title: "포트폴리오",
    icon: Briefcase,
    children: [
      {
        label: "Info 섹션",
        to: "/admin/portfolio/info",
        icon: User,
        end: false,
      },
      {
        label: "Tech Stack",
        to: "/admin/portfolio/stack",
        icon: Layers,
        end: false,
      },
      {
        label: "Approach",
        to: "/admin/portfolio/approach",
        icon: Lightbulb,
        end: false,
      },
      {
        label: "Projects",
        to: "/admin/portfolio/project",
        icon: FolderKanban,
        end: false,
      },
    ],
  },
  {
    type: "group",
    title: "챗봇",
    icon: Bot,
    children: [
      {
        /* end: true — 하위 경로(/admin/chatbot/log)에서 이 항목까지 켜지지 않게 */
        label: "프롬프트 설정",
        to: "/admin/chatbot",
        icon: MessageSquareText,
        end: true,
      },
      {
        label: "대화 기록",
        to: "/admin/chatbot/log",
        icon: History,
        end: false,
      },
      {
        /* 보여주는 값이 대부분 챗봇 사용 현황이라 챗봇 안에 둔다.
           들어오면 Info 섹션으로 가고, 통계는 필요할 때 들른다 */
        label: "통계",
        to: "/admin/chatbot/stats",
        icon: ChartColumnIcon,
        end: false,
      },
    ],
  },
];

const routeConfig: Record<string, { label: string; icon: LucideIcon | null }> =
  adminMenu.reduce(
    (acc, item) => {
      if (item.type === "link") {
        acc[item.to] = { label: item.label, icon: item.icon ?? null };
      } else {
        item.children.forEach((child) => {
          acc[child.to] = { label: child.label, icon: child.icon ?? null };
        });
      }
      return acc;
    },
    {} as Record<string, { label: string; icon: LucideIcon | null }>,
  );

export const getHeaderInfoByPath = (pathname: string) => {
  const key = Object.keys(routeConfig)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || pathname.startsWith(k + "/"));

  return (
    (key && routeConfig[key]) || {
      label: "관리자 도구",
      icon: null,
    }
  );
};
