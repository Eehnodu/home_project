// 역할: 사이드바형 공개 화면 껍데기. 왼쪽 메뉴(접기 가능, 누르면 해당 섹션으로 스크롤) + 위쪽 헤더(현재 섹션 · 링크 · 테마) + 한 페이지 본문

import { useEffect, useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from "lucide-react";
import Logo from "@/assets/logo.png";
import { GithubIcon, TistoryIcon } from "@/component/client/portfolio/icons";
import ChatWidget from "@/component/client/portfolio/chatbot/chatWidget";
import { SIDEBAR_SECTIONS, projectAnchor, scrollToSection } from "@/component/client/portfolio/sidebar/sections";
import { useGet } from "@/hooks/common/useAPI";
import { projectNumber, sortProjects } from "@/utils/project";
import { applyTheme, readDarkPreference } from "@/utils/theme";
import type { PortfolioProject } from "@/types/portfolio";
import type { PortfolioLayoutContext } from "@/container/client/portfolio/layout";

/* 접힘 상태는 기기마다 기억한다. 넓은 화면에서 접어 둔 사람은 다음에도 접힌 채로 본다 */
const COLLAPSED_KEY = "portfolio-sidebar-collapsed";

const SidebarShell = ({ context }: { context: PortfolioLayoutContext }) => {
  const [isDark, setIsDark] = useState(readDarkPreference);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === "1");
  const [activeId, setActiveId] = useState("info");

  /* 본문과 같은 조회라 캐시를 그대로 쓴다. 프로젝트 이름을 하위 메뉴로 보여준다 */
  const { data: projectData } = useGet<PortfolioProject[]>("api/portfolio/project", ["portfolio-project"]);
  const projects = useMemo(() => sortProjects(projectData ?? []), [projectData]);

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

  /* 지금 보고 있는 섹션. 화면 위쪽 1/3 지점을 지나는 섹션을 현재로 본다.
     프로젝트 목록은 데이터가 온 뒤에 그려지므로 목록이 바뀔 때 관찰 대상을 다시 잡는다 */
  useEffect(() => {
    const ids = [...SIDEBAR_SECTIONS.map((section) => section.id), ...projects.map(projectAnchor)];
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -66% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [projects]);

  /* 처음 들어온 주소에 #섹션 이 있으면 그 자리로. 프로젝트는 데이터가 온 뒤에 생기므로 목록이 바뀔 때 한 번 더 시도한다 */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) scrollToSection(hash);
  }, [projects.length]);

  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSED_KEY, prev ? "0" : "1");
      return !prev;
    });

  const handleNavigate = (id: string) => {
    setMobileOpen(false);
    setActiveId(id);
    scrollToSection(id);
  };

  const activeIndex = projects.findIndex((project) => projectAnchor(project) === activeId);
  const activeProject = activeIndex >= 0 ? projects[activeIndex] : undefined;
  const current = activeProject
    ? SIDEBAR_SECTIONS[3]
    : SIDEBAR_SECTIONS.find((section) => section.id === activeId) ?? SIDEBAR_SECTIONS[0];
  const CurrentIcon = current.icon;

  const iconButton = "rounded-lg p-2 text-txt-sub transition-colors hover:bg-surface hover:text-txt-main";

  /* 모바일 서랍은 항상 펼친 폭. 접힘은 데스크톱(md 이상)에서만 적용된다 */
  const desktopWidth = collapsed ? "md:w-16" : "md:w-60";
  const labelFade = collapsed ? "md:-translate-x-2 md:opacity-0" : "translate-x-0 opacity-100";

  return (
    <div className="select-text flex min-h-screen bg-base text-txt-main">
      {mobileOpen && (
        <div className="fixed inset-0 z-[1100] bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`select-none fixed inset-y-0 left-0 z-[1200] flex w-60 flex-col overflow-hidden border-r border-line bg-base transition-[transform,width] duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${desktopWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 로고 줄. 접힘 상태에서 로고 위에 마우스를 올리면 펼치기, 펼침 상태에서는 오른쪽에 접기 */}
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

        {/* 메뉴. 누르면 페이지가 바뀌지 않고 해당 섹션으로 스크롤한다. Projects 아래에는 프로젝트 이름이 붙는다 */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          {SIDEBAR_SECTIONS.map(({ id, title, icon: Icon }) => {
            const isActive = activeId === id || (id === "projects" && !!activeProject);
            return (
              <div key={id} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleNavigate(id)}
                  title={collapsed ? title : undefined}
                  className={`flex h-10 items-center gap-3 overflow-hidden rounded-xl px-3 text-left text-sm font-medium transition-colors ${
                    isActive ? "bg-surface text-txt-main" : "text-txt-sub hover:bg-surface hover:text-txt-main"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-300 ${labelFade}`}>{title}</span>
                </button>

                {id === "projects" && projects.length > 0 && (
                  <div className={`flex flex-col gap-0.5 border-l border-line pl-3 ml-5 ${collapsed ? "md:hidden" : ""}`}>
                    {projects.map((project, index) => {
                      const anchor = projectAnchor(project);
                      return (
                        <button
                          key={anchor}
                          type="button"
                          onClick={() => handleNavigate(anchor)}
                          className={`truncate rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                            activeId === anchor ? "text-txt-main" : "text-txt-muted hover:text-txt-main"
                          }`}
                        >
                          <span className="mr-1.5 tabular-nums">{projectNumber(index)}</span>
                          {project.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 헤더. 왼쪽은 지금 보고 있는 섹션(프로젝트 구간이면 번호 · 이름까지), 오른쪽은 테마 토글과 외부 링크 */}
        <header className="select-none sticky top-0 z-[1000] flex h-16 items-center justify-between gap-3 border-b border-line bg-base px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className={`${iconButton} md:hidden`} aria-label="메뉴 열기">
              <Menu className="h-4 w-4" />
            </button>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-txt-main">
              <CurrentIcon className="h-[18px] w-[18px]" />
            </span>
            <h1 className="flex min-w-0 items-center gap-2 text-base font-bold tracking-tight text-txt-main">
              <span className="shrink-0">{current.title}</span>
              {activeProject && (
                <span className="truncate font-medium text-txt-sub">
                  · {projectNumber(activeIndex)} {activeProject.name}
                </span>
              )}
            </h1>
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
            <a href="https://eehnodu.tistory.com/" target="_blank" rel="noopener noreferrer" className={iconButton} aria-label="Tistory 블로그">
              <TistoryIcon />
            </a>
            <a href="https://github.com/Eehnodu" target="_blank" rel="noopener noreferrer" className={iconButton} aria-label="GitHub">
              <GithubIcon />
            </a>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-4xl">
            <Outlet context={context} />
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

export default SidebarShell;
