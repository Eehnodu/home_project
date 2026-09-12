// 역할: CS 모아 레이아웃 — 사이드바 · 헤더 · 스크롤 영역. 경로가 바뀌면 본문 스크롤을 맨 위로

import { useRef, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ClientSidebar from "@/component/client/layout/sideBar/sideBar";
import ClientHeader from "@/component/client/layout/header/header";
import { BookOpen } from "lucide-react";
import { buildRouteConfig, createHeaderResolver } from "@/types/client/sidebar";
import { csMenu } from "@/types/cs/menu";

const routeConfig = { ...buildRouteConfig(csMenu), "/cs": { label: "CS 모아", subIcon: BookOpen, groupIcon: null } };

const getHeaderInfoByPath = createHeaderResolver(routeConfig, { label: "CS 모아", subIcon: BookOpen, groupIcon: null });

const CsLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    /* 스크롤은 window 가 아니라 이 div 에서 일어난다. App 의 ScrollToTop 이 닿지 않아 따로 올린다 */
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-full bg-base text-txt-main">
      <ClientSidebar
        collapsed={sidebarCollapsed}
        clientMenu={csMenu}
        onToggleSidebar={handleToggleSidebar}
        title="CS 모아"
        titleTo="/cs"
      />

      <main className="flex min-h-0 flex-1 flex-col bg-base min-w-0">
        <ClientHeader getHeaderInfoByPath={getHeaderInfoByPath} />
        <section className="relative flex-1 bg-base px-10 py-8 min-h-0">
          <div ref={scrollRef} className="w-full h-full min-h-0 overflow-y-auto scrollbar-hide">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default CsLayout;
