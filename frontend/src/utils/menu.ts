// 역할: 메뉴 정의에서 경로 → 제목 맵을 만들고 현재 경로의 제목을 찾는다

import { ClientMenuItem } from "@/types/client/sidebar";

// 메뉴 아이템 배열을 { "/path": "Label" } 형태의 맵으로 변환합니다.
export const createRouteTitleMap = (
  menu: ClientMenuItem[],
): Record<string, string> => {
  return menu.reduce(
    (acc, item) => {
      if (item.type === "link") {
        acc[item.to] = item.label;
      } else if (item.type === "group") {
        item.children.forEach((child) => {
          acc[child.to] = child.label;
        });
      }
      return acc;
    },
    {} as Record<string, string>,
  );
};

// 현재 경로(pathname)에 맞는 타이틀을 맵에서 찾아 반환합니다.
export const getTitleByPath = (
  pathname: string,
  routeTitleMap: Record<string, string>,
): string => {
  const key = Object.keys(routeTitleMap)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || pathname.startsWith(k + "/"));

  return (key && routeTitleMap[key]) || "";
};
