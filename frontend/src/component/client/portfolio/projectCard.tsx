import { formatPeriod } from "@/utils/format/date";
import type { PortfolioProject } from "@/types/portfolio";
import KindBadge from "@/component/client/portfolio/kindBadge";
import { projectNumber } from "@/utils/project";

interface ProjectCardProps {
  project: PortfolioProject;
  /** 목록에서의 순서. 01. 02. 로 이름 앞에 붙는다 */
  index: number;
  onClick: (project: PortfolioProject) => void;
}

const ProjectCard = ({ project, index, onClick }: ProjectCardProps) => {

  return (
    <button
      onClick={() => onClick(project)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line text-left transition-colors hover:border-line-active hover:bg-surface"
    >
      {/* 텍스트 */}
      <div className="flex flex-1 flex-col gap-2.5 px-5 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm font-bold tabular-nums text-txt-muted">
              {projectNumber(index)}
            </span>
            <span className="truncate text-base font-bold tracking-tight text-txt-main">
              {project.name}
            </span>
            <KindBadge kind={project.kind} />
          </div>
          <span className="text-xs tabular-nums text-txt-sub">
            {formatPeriod(project.start_date, project.end_date)}
          </span>
        </div>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-txt-sub">
          {project.summary}
        </p>

        {/* 기술 스택 — 3개까지 노출하고 나머지는 개수로 */}
        {/* 칩에는 border 가 있어 높이가 2px 더 크다. +N 쪽에도 투명 border 를 줘서
            같은 높이로 맞추고, inline-flex 로 글자를 세로 중앙에 놓는다. */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {project.tech_stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded-md border border-line px-2 py-0.5 text-[11px] font-medium leading-none text-txt-sub"
            >
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 3 && (
            <span className="inline-flex items-center rounded-md border border-transparent px-1 py-0.5 text-[11px] font-medium leading-none text-txt-muted">
              +{project.tech_stack.length - 3}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ProjectCard;
