// 역할: 사이드바형 본문. Info · Tech Stack · Approach · Projects 를 한 페이지에 이어 두고, 프로젝트는 모달 없이 펼쳐 보여준다.
// 사이드바 메뉴가 이 섹션 id 로 스크롤한다

import type { LucideIcon } from "lucide-react";
import InfoPage from "@/container/client/portfolio/sidebar/infoPage";
import StackPage from "@/container/client/portfolio/sidebar/stackPage";
import ApproachPage from "@/container/client/portfolio/sidebar/approachPage";
import ProjectDetail from "@/component/client/portfolio/projectDetail";
import OtherProjects from "@/component/client/portfolio/otherProjects";
import Skeleton from "@/component/client/ui/skeleton";
import { useGet } from "@/hooks/common/useAPI";
import { formatPeriod } from "@/utils/format/date";
import type { PortfolioProject } from "@/types/portfolio";
import { SIDEBAR_SECTIONS, projectAnchor } from "@/component/client/portfolio/sidebar/sections";
import KindBadge from "@/component/client/portfolio/kindBadge";
import { projectNumber, sortProjects } from "@/utils/project";

/* scroll-mt: 위쪽 고정 헤더(4rem) 아래에 섹션 제목이 오도록 여유를 둔다 */
const Block = ({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) => (
  <section id={id} className="flex scroll-mt-24 flex-col gap-6">
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-txt-main">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-txt-main">{title}</h2>
    </div>
    {children}
  </section>
);

const ProjectsBlock = () => {
  const { data, isLoading } = useGet<PortfolioProject[]>("api/portfolio/project", ["portfolio-project"]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-4 rounded-2xl border border-line px-6 py-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  const projects = sortProjects(data ?? []);

  return (
    <div className="flex flex-col gap-6">
      {projects.map((project, index) => (
        <article
          key={project.id ?? project.name}
          id={projectAnchor(project)}
          className="flex scroll-mt-24 flex-col gap-5 rounded-2xl border border-line px-6 py-6 sm:px-8"
        >
          <header className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="shrink-0 text-xl font-bold tabular-nums text-txt-muted">{projectNumber(index)}</span>
                <h3 className="text-xl font-bold tracking-tight text-txt-main">{project.name}</h3>
                <KindBadge kind={project.kind} />
              </div>
              <span className="text-xs tabular-nums text-txt-muted">
                {formatPeriod(project.start_date, project.end_date)}
              </span>
            </div>
            {project.summary && <p className="text-sm text-txt-sub">{project.summary}</p>}
          </header>
          <ProjectDetail project={project} showSummary={false} />
        </article>
      ))}
      <OtherProjects />
    </div>
  );
};

const SidebarHome = () => {
  const [info, stack, approach, projects] = SIDEBAR_SECTIONS;

  return (
    <div className="reveal is-visible flex flex-col gap-16 pb-16">
      <Block {...info}>
        <InfoPage />
      </Block>
      <Block {...stack}>
        <StackPage />
      </Block>
      <Block {...approach}>
        <ApproachPage />
      </Block>
      <Block {...projects}>
        <ProjectsBlock />
      </Block>
    </div>
  );
};

export default SidebarHome;
