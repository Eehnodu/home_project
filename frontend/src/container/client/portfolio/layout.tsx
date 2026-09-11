// 역할: 포트폴리오 공개 페이지의 공통 껍데기. 관리자가 고른 화면 구성(헤더형 · 사이드바형)에 따라 껍데기를 바꾼다

import { Outlet, useOutletContext } from "react-router-dom";
import Header from "@/component/client/portfolio/header";
import ChatWidget from "@/component/client/portfolio/chatbot/chatWidget";
import SidebarShell from "@/component/client/portfolio/sidebar/sidebarShell";
import { useGet } from "@/hooks/common/useAPI";
import type { PortfolioInfo, PortfolioLayoutType } from "@/types/portfolio";

/** 자식 페이지가 어떤 껍데기 안에 있는지 알 수 있게 넘긴다 */
export interface PortfolioLayoutContext {
  layout: PortfolioLayoutType;
}

export const usePortfolioLayout = () =>
  useOutletContext<PortfolioLayoutContext | undefined>()?.layout ?? "header";

/* 마지막으로 본 구성을 기억해 두면 다음 방문에 API 응답 전에도 같은 껍데기를 바로 그릴 수 있다.
   구성이 바뀐 직후 한 번만 늦게 반영되고, 그 외에는 껍데기가 바뀌며 깜빡이는 일이 없다 */
const LAYOUT_KEY = "portfolio-layout";

const readCachedLayout = (): PortfolioLayoutType | null => {
  const saved = localStorage.getItem(LAYOUT_KEY);
  return saved === "header" || saved === "sidebar" ? saved : null;
};

/**
 * select-text: index.css 가 전역으로 user-select:none 을 걸어두기 때문에
 * 읽는 페이지에서는 다시 선택 가능하게 열어준다.
 */
const PortfolioLayout = () => {
  const { data, isLoading } = useGet<PortfolioInfo>("api/portfolio/info", ["portfolio-info"]);

  const cached = readCachedLayout();
  const layout: PortfolioLayoutType = data?.layout ?? cached ?? "header";

  if (data?.layout && data.layout !== cached) {
    localStorage.setItem(LAYOUT_KEY, data.layout);
  }

  /* 처음 방문이라 기억도 응답도 없으면 빈 배경만 둔다. 잘못된 껍데기를 먼저 그리고 바꾸는 것보다 낫다 */
  if (isLoading && !cached) {
    return <div className="min-h-screen bg-base" />;
  }

  const context: PortfolioLayoutContext = { layout };

  if (layout === "sidebar") {
    return <SidebarShell context={context} />;
  }

  return (
    <div className="select-text min-h-screen bg-base text-txt-main">
      <Header />
      <Outlet context={context} />
      <ChatWidget />
    </div>
  );
};

export default PortfolioLayout;
