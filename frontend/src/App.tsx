// 역할: 라우트 트리 · QueryClient · AuthProvider 조립. 공개 포트폴리오 / CS / 관리자 세 영역을 한 라우터에 둔다

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import LoginPage from "./container/admin/login";
import AdminLayout from "./container/admin/layout";
import NotFoundPage from "./container/notfound";
import { AuthProvider } from "./context/AuthProvider";
import adminRoutes from "./routes/adminRoutes";
import PortfolioLayout from "./container/client/portfolio/layout";
import { ApproachRoute, HomeRoute, StackRoute } from "./container/client/portfolio/routes";
import ProjectListPage from "./container/client/portfolio/projectList";
import GoogleCallback from "./hooks/auth/googleCallback";
import CsLayout from "./container/client/cs/layout";
import csRoutes from "./routes/csRoutes";

/**
 * 라우트 이동 시 스크롤을 맨 위로 되돌린다.
 *
 * 브라우저는 새로고침할 때 이전 스크롤 위치를 비동기로 복원하는데(scrollRestoration),
 * 그게 React 의 effect 보다 늦게 실행되면 강제로 올려둔 스크롤을 다시 끌어내려
 * 첫 화면이 살짝 밀려 보인다. 복원을 manual 로 끄고 직접 제어한다.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    /* 해시가 있으면 해당 섹션으로 이동시키고, 없을 때만 맨 위로 */
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

// QueryClient 는 앱 전체에서 하나만 쓴다. 컴포넌트 안에서 만들면 리렌더마다 캐시가 새로 생긴다
const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route element={<PortfolioLayout />}>
                <Route path="/" element={<HomeRoute />} />
                <Route path="/stack" element={<StackRoute />} />
                <Route path="/approach" element={<ApproachRoute />} />
                <Route path="/projects" element={<ProjectListPage />} />
              </Route>

              <Route element={<CsLayout />}>
                {csRoutes}
              </Route>

              <Route path="/google/login" element={<GoogleCallback apiURL="api/auth/google_admin" redirectURL="/admin" />} />
              <Route path="/admin/login" element={<LoginPage />} />
              <Route element={<AdminLayout />}>
                {adminRoutes}
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
