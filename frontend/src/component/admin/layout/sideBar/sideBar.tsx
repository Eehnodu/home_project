// 역할: 관리자 사이드바 — 메뉴 · 접기 · 다크모드 · 프로필/로그아웃

import GroupLink from "./groupLink";
import SubLink from "./subLink";
import Logo from "@/assets/logo.png";
import { SidebarCloseIcon, SidebarOpenIcon } from "lucide-react";
import { usePost } from "@/hooks/common/useAPI";
import { useNavigate } from "react-router-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { AdminSidebarProps } from "@/types/admin/sidebar";
import LogoutModal from "@/component/admin/modal/logoutModal";
import DarkMode from "./darkMode";
import Profile from "./profile";

/* 공개 사이트와 같은 키를 쓴다. 한쪽에서 바꾼 테마가 다른 쪽에도 그대로 이어진다 */
const THEME_STORAGE_KEY = "portfolio-theme";

function readDarkPreference(): boolean {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const AdminSidebar = ({
  collapsed,
  adminMenu,
  onToggleSidebar,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) => {
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  /* 접힘 · 펼침 전환(300ms) 중에는 hover 로 뜨는 토글을 숨긴다.
     접는 순간 마우스가 아직 헤더 위에 있어 반대쪽 아이콘이 잠깐 비치던 문제 */
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    setTransitioning(true);
    const timer = window.setTimeout(() => setTransitioning(false), 320);
    return () => window.clearTimeout(timer);
  }, [collapsed]);
  const logoutMutation = usePost<void, void>("api/auth/logout_admin");
  const [isDark, setIsDark] = useState(readDarkPreference);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/admin/login"),
    });
  };

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
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}
    <aside
      className={`
        h-screen flex flex-col overflow-hidden border-r transition-all duration-300 ease-in-out
        bg-[#1c1917] text-neutral-200 border-[#292524]
        fixed z-40 md:relative
        md:${collapsed ? "w-16" : "w-64"}
        w-64
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      <div className="flex h-full flex-col">
        {/* 헤더 영역 */}
        <div className="group flex h-16 items-center flex-shrink-0 border-b border-[#292524] relative overflow-hidden text-white">
          <div className="relative flex items-center justify-center w-16 h-full shrink-0 z-10">
            <img
              src={Logo}
              alt="Profile"
              className={`h-6 w-6 object-contain transition-opacity duration-200 
        ${collapsed && !transitioning ? "group-hover:opacity-0" : "opacity-100"}`}
            />

            {collapsed && !transitioning && (
              <div
                onClick={onToggleSidebar}
                className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <SidebarOpenIcon className="w-4 h-4" />
              </div>
            )}
          </div>

          <div
            className={`
    absolute left-14 transition-all duration-300 ease-in-out
    ${collapsed ? "opacity-0 -translate-x-2 invisible" : "opacity-100 translate-x-0 visible"}
  `}
          >
            <h1 className="text-xl font-bold whitespace-nowrap tracking-tight">
              관리자
            </h1>
          </div>

          {!collapsed && !transitioning && (
            <div
              onClick={onToggleSidebar}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <SidebarCloseIcon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex-1 overflow-y-auto px-2 py-6">
          <div className="flex flex-col gap-y-1">
            {adminMenu.map((item, idx) =>
              item.type === "link" ? (
                <SubLink
                  key={`${item.to}-${idx}`}
                  {...item}
                  collapsed={collapsed}
                />
              ) : (
                <GroupLink
                  key={`${item.title}-${idx}`}
                  item={item}
                  collapsed={collapsed}
                />
              ),
            )}
          </div>
        </nav>

        <DarkMode
          isDark={isDark}
          handleToggleTheme={handleToggleTheme}
          collapsed={collapsed}
        />

        <Profile
          collapsed={collapsed}
          onOpenLogout={() => setLogoutModalOpen(true)}
        />
      </div>

    </aside>
      <LogoutModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default AdminSidebar;
