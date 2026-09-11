// 역할: 같은 주소가 화면 구성에 따라 다른 페이지를 그리도록 갈라 주는 라우트 요소들

import { Navigate } from "react-router-dom";
import PortfolioPage from "@/container/client/portfolio/main";
import InfoPage from "@/container/client/portfolio/sidebar/infoPage";
import StackPage from "@/container/client/portfolio/sidebar/stackPage";
import ApproachPage from "@/container/client/portfolio/sidebar/approachPage";
import { usePortfolioLayout } from "@/container/client/portfolio/layout";

/** "/" — 헤더형은 네 섹션을 한 페이지에, 사이드바형은 Info 페이지만 */
export const HomeRoute = () =>
  usePortfolioLayout() === "sidebar" ? <InfoPage /> : <PortfolioPage />;

/** "/stack" — 헤더형에서는 메인의 해당 섹션으로 보낸다 */
export const StackRoute = () =>
  usePortfolioLayout() === "sidebar" ? <StackPage /> : <Navigate to="/#techstack" replace />;

/** "/approach" */
export const ApproachRoute = () =>
  usePortfolioLayout() === "sidebar" ? <ApproachPage /> : <Navigate to="/#approach" replace />;
