// 역할: CS 모아 사이드바 — 메뉴 · 접기 · 다크모드. 모바일에서는 오버레이로 펼쳐진다

import GroupLink from "./groupLink";
import SubLink from "./subLink";
import Logo from "@/assets/logo.png";
import { SidebarCloseIcon, SidebarOpenIcon } from "lucide-react";
import { ClientSidebarProps } from "@/types/client/sidebar";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useState } from "react";
import DarkMode from "./darkMode";

/* 공개 사이트와 같은 키를 쓴다. 한쪽에서 바꾼 테마가 다른 쪽에도 그대로 이어진다 */
const THEME_STORAGE_KEY = "portfolio-theme";

function readDarkPreference(): boolean {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const ClientSidebar = ({
  collapsed,
  clientMenu,
  onToggleSidebar,
  mobileOpen = false,
  onMobileClose,
  title = "타이틀",
  titleTo,
}: ClientSidebarProps & { title?: string; titleTo?: string }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(readDarkPreference);

  // 모바일 오버레이는 항상 w-64 고정이므로 collapsed 상태를 무시하고 펼쳐서 보여준다
  const effectiveCollapsed = collapsed && !mobileOpen;

  /* paint 전에 클래스를 넣어야 한다. useEffect 면 한 프레임 밝게 그려진 뒤 바뀐다 */
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleToggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
  };

  return (
    <>
      {/* 모바일 백드롭 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`
        h-screen flex flex-col overflow-hidden border-r transition-all duration-300 ease-in-out
        border-[#292524] bg-[#1c1917] text-neutral-200
        dark:border-zinc-800 dark:bg-zinc-950 dark:text-neutral-100
        fixed z-40 md:relative
        ${collapsed ? "md:w-16" : "md:w-64"}
        w-64
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="flex h-full flex-col">
          {/* 헤더 영역 */}
          <div className="group relative flex h-16 flex-shrink-0 items-center overflow-hidden border-b border-[#292524] text-white dark:border-zinc-800">
            <div className="relative flex items-center justify-center w-16 h-full shrink-0 z-10">
              <img
                src={Logo}
                alt="Profile"
                className={`h-6 w-6 object-contain transition-opacity duration-200
        ${effectiveCollapsed ? "md:group-hover:opacity-0" : "opacity-100"}`}
              />

              {effectiveCollapsed && (
                <div
                  onClick={onToggleSidebar}
                  className="absolute inset-0 hidden md:flex items-center justify-center z-20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <SidebarOpenIcon className="w-4 h-4" />
                </div>
              )}
            </div>

            <div
              className={`
    absolute left-14 transition-all duration-300 ease-in-out
    ${effectiveCollapsed ? "opacity-0 -translate-x-2 invisible" : "opacity-100 translate-x-0 visible"}
  `}
            >
              <h1
                className={`text-xl font-bold whitespace-nowrap tracking-tight ${titleTo ? "cursor-pointer hover:opacity-70 transition-opacity" : ""}`}
                onClick={() => titleTo && navigate(titleTo)}
              >
                {title}
              </h1>
            </div>

            {!effectiveCollapsed && (
              <div
                onClick={onToggleSidebar}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block"
              >
                <SidebarCloseIcon className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* 메뉴 리스트 */}
          <nav className="flex-1 overflow-y-auto px-2 py-6">
            <div className="flex flex-col gap-y-1">
              {clientMenu.map((item, idx) =>
                item.type === "link" ? (
                  <SubLink
                    key={`${item.to}-${idx}`}
                    {...item}
                    collapsed={effectiveCollapsed}
                  />
                ) : (
                  <GroupLink
                    key={`${item.title}-${idx}`}
                    item={item}
                    collapsed={effectiveCollapsed}
                  />
                ),
              )}
            </div>
          </nav>

          <DarkMode
            isDark={isDark}
            handleToggleTheme={handleToggleTheme}
            collapsed={effectiveCollapsed}
          />
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;
