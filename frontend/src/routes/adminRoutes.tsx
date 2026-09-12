// 역할: /admin 하위 라우트 정의. AdminLayout 안에서 렌더된다

import { Navigate, Route } from "react-router-dom";
import AdminChatbotStatsPage from "@/container/admin/chatbot/stats";
import AdminPortfolioInfoPage from "@/container/admin/portfolio/info";
import AdminPortfolioStackPage from "@/container/admin/portfolio/techstack";
import AdminPortfolioApproachPage from "@/container/admin/portfolio/approach";
import AdminPortfolioProjectPage from "@/container/admin/portfolio/project";
import AdminChatbotSettingPage from "@/container/admin/chatbot/setting";
import AdminChatbotLogPage from "@/container/admin/chatbot/log";

const adminRoutes = (
  <>
    {/* 들어오면 바로 편집 화면으로. 통계는 챗봇 메뉴 안에 있다 */}
    <Route path="/admin" element={<Navigate to="/admin/portfolio/info" replace />} />
    <Route path="/admin/chatbot/stats" element={<AdminChatbotStatsPage />} />
    <Route
      path="/admin/portfolio/info"
      element={<AdminPortfolioInfoPage />}
    />
    <Route
      path="/admin/portfolio/stack"
      element={<AdminPortfolioStackPage />}
    />
    <Route
      path="/admin/portfolio/approach"
      element={<AdminPortfolioApproachPage />}
    />
    <Route
      path="/admin/portfolio/project"
      element={<AdminPortfolioProjectPage />}
    />
    <Route path="/admin/chatbot" element={<AdminChatbotSettingPage />} />
    <Route path="/admin/chatbot/log" element={<AdminChatbotLogPage />} />
  </>
);

export default adminRoutes;
