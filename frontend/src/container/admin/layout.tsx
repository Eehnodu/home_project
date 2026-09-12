// 역할: 관리자 화면 껍데기 — 인증 게이트 · 사이드바 · 헤더 · 본문 영역

import { parseUserInfo, refreshExp } from "@/hooks/common/getCookie";
import { useRefreshToken } from "@/hooks/common/useAPI";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "@/component/admin/layout/sideBar/sideBar";
import AdminHeader from "@/component/admin/layout/header/header";
import { adminMenu, getHeaderInfoByPath } from "@/types/admin/menu";

const AdminLayout = () => {
  const location = useLocation();
  /* user_info 쿠키(1시간)로 로그인 여부를, refresh_exp 쿠키(6시간)로 갱신 가능 여부를 본다 */
  const user = parseUserInfo("admin");
  const isRefresh = refreshExp("admin");
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    /* access 는 만료됐지만 refresh 가 살아 있는 경우. 갱신 후 새 쿠키를 다시 읽어야 해서
       상태를 고치는 대신 새로고침한다. 갱신도 실패하면 로그인으로 */
    if (!user && isRefresh) {
      refresh()
        .then(() => {
          window.location.reload();
        })
        .catch(() => {
          navigate("/admin/login", { replace: true });
        });
    }
  }, [user, isRefresh, navigate, refresh]);

  if (user && user.auth_type !== "admin") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!user && !isRefresh) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!user && isRefresh) {
    /* 위 effect 가 갱신 중. 로그인 화면이 잠깐 비치지 않게 빈 화면을 둔다 */
    return null;
  }

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-full bg-adminMain text-main">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        adminMenu={adminMenu}
        onToggleSidebar={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex h-screen flex-1 flex-col min-w-0">
        <AdminHeader
          getHeaderInfoByPath={getHeaderInfoByPath}
          onMobileMenuClick={() => setMobileOpen(true)}
        />
        {/* 좌우 여백을 넉넉히 준다 — 화면 가장자리에 카드가 붙으면 답답하고,
            차트 마지막 막대가 잘려 보인다. 모바일은 조금 좁게 */}
        <section className="relative flex-1 px-5 py-6 min-h-0 sm:px-8 lg:px-12">
          <div className="w-full h-full min-h-0 overflow-y-auto scrollbar-hide">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
