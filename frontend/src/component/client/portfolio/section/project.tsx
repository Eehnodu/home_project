import { useState } from "react";
import { Link } from "react-router-dom";
import { Code, ArrowRight } from "lucide-react";
import SectionWrapper from "./sectionWrapper";
import ProjectCard from "@/component/client/portfolio/projectCard";
import ProjectModal from "@/component/client/portfolio/modal/projectModal";
import { useGet } from "@/hooks/common/useAPI";
import type { PortfolioProject } from "@/types/portfolio";
import ProjectGridSkeleton from "@/component/client/portfolio/skeleton/projectGridSkeleton";

/** 메인에서는 최근 6개만 노출하고, 나머지는 View all projects 로 넘긴다. 이미지가 없는 카드라 3열 2줄이 한 화면에 들어온다 */
const PREVIEW_COUNT = 6;
const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

/* 폴백을 두지 않는다. 관리자 화면에서 넣은 값만 그린다. */
const ProjectSection = () => {
  const { data, isLoading } = useGet<PortfolioProject[]>(
    "api/portfolio/project",
    ["portfolio-project"],
  );
  const [selected, setSelected] = useState<PortfolioProject | null>(null);

  const projects = data ?? [];
  const preview = projects.slice(0, PREVIEW_COUNT);

  return (
    <>
      <SectionWrapper
        id="project"
        title="Projects"
        subtitle="진행한 프로젝트들을 정리했습니다."
        subtitleRight={
          <Link
            to="/projects"
            className="flex shrink-0 items-center gap-1 text-sm text-txt-sub transition-colors hover:text-txt-main"
          >
            View all projects
            {projects.length > 0 && (
              <span className="tabular-nums text-txt-muted">
                ({projects.length})
              </span>
            )}
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
        icon={Code}
      >
        {isLoading ? (
          <ProjectGridSkeleton count={PREVIEW_COUNT} className={GRID} />
        ) : preview.length > 0 ? (
          <div className={GRID}>
            {preview.map((project) => (
              <ProjectCard
                key={project.id ?? project.name}
                project={project}
                onClick={setSelected}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-line py-12 text-center text-sm text-txt-sub">
            등록된 프로젝트가 없습니다.
          </p>
        )}
      </SectionWrapper>

      <ProjectModal
        open={!!selected}
        onClose={() => setSelected(null)}
        project={selected}
      />
    </>
  );
};

export default ProjectSection;
