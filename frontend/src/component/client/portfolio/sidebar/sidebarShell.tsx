// 역할: 사이드바형 공개 화면 껍데기. 왼쪽 메뉴 목록(접기 가능) + 위쪽 헤더(페이지 이름 · 링크 · 테마) + 본문. 관리자 화면과 같은 배치를 방문자 화면에 쓴다

import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Code,
  Layers,
  Lightbulb,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import Logo from "@/assets/logo.png";
import { GithubIcon, TistoryIcon } from "@/component/client/portfolio/icons";
import ChatWidget from "@/component/client/portfolio/chatbot/chatWidget";
import { applyTheme, readDarkPreference } from "@/utils/theme";
import type { PortfolioLayoutContext } from "@/container/client/portfolio/layout";

interface MenuItem {
  to: string;
  label: string;
  /** 헤더에 보이는 페이지 설명 */
  description: string;
  icon: LucideIcon;
}

/* 헤더형의 섹션 네 개가 사이드바형에서는 페이지 네 개가 된다 */
export const SIDEBAR_MENU: MenuItem[] = [
  { to: "/", label: "Info", description: "저에 대한 소개입니다.", icon: User },
  { to: "/stack", label: "Tech Stack", description: "실제 프로젝트에서 사용해 본 기술입니다.", icon: Layers },
  { to: "/approach", label: "Approach", description: "개발할 때 중요하게 생각하는 원칙입니다.", icon: Lightbulb },
  { to: "/projects", label: "Projects", description: "진행한 프로젝트들을 정리했습니다.", icon: Code },
];

/* 접힘 상태는 기기마다 기억한다. 넓은 화면에서 접어 둔 사람은 다음에도 접힌 채로 본다 */
const COLLAPSED_KEY = "portfolio-sidebar-collapsed";

const SidebarShell = ({ context }: { context: PortfolioLayoutContext }) => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(readDarkPreference);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === "1",
  );

  /* 접힘 · 펼침 전환(300ms) 중에는 hover 로 뜨는 토글을 숨긴다.
     접는 순간 마우스가 아직 헤더 위에 있어 반대쪽 아이콘이 잠깐 비치는 것을 막는다 */
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    setTransitioning(true);
    const timer = window.setTimeout(() => setTransitioning(false), 320);
    return () => window.clearTimeout(timer);
  }, [collapsed]);

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  /* 페이지가 바뀌면 모바일 서랍은 닫는다 */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSED_KEY, prev ? "0" : "1");
      return !prev;
    });

  const current =
    SIDEBAR_MENU.find((item) => item.to === location.pathname) ?? SIDEBAR_MENU[0];
  const CurrentIcon = current.icon;

  const iconButton =
    "rounded-lg p-2 text-txt-sub transition-colors hover:bg-surface hover:text-txt-main";

  /* 모바일 서랍은 항상 펼친 폭. 접힘은 데스크톱(md 이상)에서만 적용된다 */
  const desktopWidth = collapsed ? "md:w-16" : "md:w-60";

  return (
    <div className="select-text flex min-h-screen bg-base text-txt-main">
      {/* 모바일 서랍 배경 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[1100] bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 사이드바. 데스크톱은 항상 보이고(접기 가능), 모바일은 서랍으로 미끄러져 나온다 */}
      <aside
        className={`select-none fixed inset-y-0 left-0 z-[1200] flex w-60 flex-col overflow-hidden border-r border-line bg-base transition-[transform,width] duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${desktopWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 로고 줄. 접힘 상태에서 로고 위에 마우스를 올리면 펼치기 아이콘이, 펼침 상태에서는 오른쪽에 접기 아이콘이 뜬다 */}
        <div className="group relative flex h-16 shrink-0 items-center border-b border-line">
          <div className="relative flex h-full w-16 shrink-0 items-center justify-center">
            <Link to="/" aria-label="처음으로" className="flex items-center justify-center">
              <img
                src={Logo}
                alt=""
                aria-hidden
                className={`h-8 w-8 rounded-lg object-cover transition-opacity duration-200 ${
                  collapsed && !transitioning ? "md:group-hover:opacity-0" : "opacity-100"
                }`}
              />
            </Link>
            {collapsed && !transitioning && (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="absolute inset-0 hidden items-center justify-center text-txt-main opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex"
                aria-label="사이드바 펼치기"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}
          </div>

          <Link
            to="/"
            className={`absolute left-14 whitespace-nowrap text-lg font-bold tracking-tight text-txt-main transition-all duration-300 ${
              collapsed ? "md:invisible md:-translate-x-2 md:opacity-0" : "visible translate-x-0 opacity-100"
            }`}
          >
            Nodu
          </Link>

          {!collapsed && !transitioning && (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="absolute right-3 hidden rounded-lg p-2 text-txt-sub opacity-0 transition-opacity duration-200 hover:bg-surface hover:text-txt-main group-hover:opacity-100 md:block"
              aria-label="사이드바 접기"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={`${iconButton} absolute right-3 md:hidden`}
            aria-label="메뉴 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {SIDEBAR_MENU.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-surface text-txt-main"
                    : "text-txt-sub hover:bg-surface hover:text-txt-main"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  collapsed ? "md:-translate-x-2 md:opacity-0" : "translate-x-0 opacity-100"
                }`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 본문 열 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 헤더. 왼쪽은 현재 페이지 아이콘 · 이름 · 설명, 오른쪽은 테마 토글과 외부 링크 */}
        <header className="select-none sticky top-0 z-[1000] flex h-16 items-center justify-between gap-3 border-b border-line bg-base px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={`${iconButton} md:hidden`}
              aria-label="메뉴 열기"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-txt-main">
              <CurrentIcon className="h-[18px] w-[18px]" />
            </span>
            <div className="flex min-w-0 flex-col">
              <h1 className="truncate text-base font-bold tracking-tight text-txt-main">
                {current.label}
              </h1>
              <p className="hidden truncate text-xs text-txt-sub sm:block">
                {current.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className={iconButton}
              aria-label={isDark ? "라이트모드로 전환" : "다크모드로 전환"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a
              href="https://eehnodu.tistory.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={iconButton}
              aria-label="Tistory 블로그"
            >
              <TistoryIcon />
            </a>
            <a
              href="https://github.com/Eehnodu"
              target="_blank"
              rel="noopener noreferrer"
              className={iconButton}
              aria-label="GitHub"
            >
              <GithubIcon />
            </a>
          </div>
        </header>

        {/* 본문은 남는 폭의 가운데에 좁게 두고, 화면보다 짧으면 세로로도 가운데에 둔다.
            페이지가 바뀔 때마다 같은 등장 애니메이션을 탄다 */}
        <main className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div key={location.pathname} className="reveal is-visible mx-auto w-full max-w-4xl">
            <Outlet context={context} />
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

export default SidebarShell;
