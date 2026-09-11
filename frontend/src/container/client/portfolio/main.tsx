// 역할: 포트폴리오 메인 — Info · Tech Stack · Approach · Projects 섹션을 순서대로 그린다

import { CONTAINER } from "@/component/client/portfolio/layout";
import InfoSection from "@/component/client/portfolio/section/info";
import TechStackSection from "@/component/client/portfolio/section/techstack";
import ApproachSection from "@/component/client/portfolio/section/approach";
import ProjectSection from "@/component/client/portfolio/section/project";

/** 헤더·배경·챗봇은 PortfolioLayout 이 그린다. 여기는 섹션만 */
const PortfolioMain = () => {
  return (
    <main className={CONTAINER}>
      <InfoSection />
      <TechStackSection />
      <ApproachSection />
      <ProjectSection />
    </main>
  );
};

export default PortfolioMain;
