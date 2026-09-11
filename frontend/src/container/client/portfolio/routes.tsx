// 역할: 같은 주소가 화면 구성에 따라 다른 페이지를 그리도록 갈라 주는 라우트 요소들

import { Navigate } from "react-router-dom";
import PortfolioPage from "@/container/client/portfolio/main";
import ProjectListPage from "@/container/client/portfolio/projectList";
import SidebarHome from "@/container/client/portfolio/sidebar/home";
import { usePortfolioLayout } from "@/container/client/portfolio/layout";

/** "/" — 헤더형은 섹션 넷 + 카드, 사이드바형은 섹션 넷 + 펼친 프로젝트를 한 페이지에 */
export const HomeRoute = () =>
  usePortfolioLayout() === "sidebar" ? <SidebarHome /> : <PortfolioPage />;

/* 사이드바형은 한 페이지라 예전 주소(/stack · /approach · /projects)는 해당 섹션으로 보낸다.
   헤더형은 메인의 같은 섹션으로 보낸다 */
export const StackRoute = () =>
  <Navigate to={usePortfolioLayout() === "sidebar" ? "/#stack" : "/#techstack"} replace />;

export const ApproachRoute = () => <Navigate to="/#approach" replace />;

export const ProjectsRoute = () =>
  usePortfolioLayout() === "sidebar" ? <Navigate to="/#projects" replace /> : <ProjectListPage />;
