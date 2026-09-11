// 역할: 프로젝트 한 건의 상세 본문. 헤더형은 모달 안에서, 사이드바형은 페이지에 펼쳐서 같은 본문을 쓴다

import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject, ProjectPoint } from "@/types/portfolio";

/** 줄바꿈으로 나뉜 텍스트를 문단 배열로 */
const toLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/** 섹션 제목 — 왼쪽 세로 막대 + 진한 글자로 본문과 확실히 구분한다 */
const Label = ({ children }: { children: string }) => (
  <h4 className="flex items-center gap-2 text-sm font-bold tracking-tight text-txt-main">
    <span aria-hidden className="h-3.5 w-[3px] rounded-full bg-txt-main" />
    {children}
  </h4>
);

/** 섹션 사이에 구분선을 넣어 블록이 나뉘어 보이게 한다 */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-3 border-t border-line pt-5">
    <Label>{title}</Label>
    {children}
  </section>
);

/** 역할·팀·링크처럼 작은 항목 이름 */
const Meta = ({ children }: { children: string }) => (
  <p className="text-[11px] font-semibold tracking-wide text-txt-muted">
    {children}
  </p>
);

/** 핵심 · 기능 · 문제와 개선 공용 — 굵은 제목 한 줄 아래 설명. 제목이 없는 예전 항목은 설명만 */
const Points = ({ items }: { items: ProjectPoint[] }) => (
  <ul className="flex flex-col gap-3">
    {items.map((item, index) => (
      <li key={index} className="flex gap-3">
        <span className="shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-txt-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          {item.title && <p className="text-sm font-semibold text-txt-main">{item.title}</p>}
          {item.body && <p className="text-sm leading-relaxed text-txt-sub">{item.body}</p>}
        </div>
      </li>
    ))}
  </ul>
);

const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <span key={item} className="rounded-full border border-line px-3 py-1 text-xs text-txt-sub">
        {item}
      </span>
    ))}
  </div>
);

/**
 * 운영 지표. 숫자가 있는 프로젝트만 보인다.
 * 한 줄로 나란히 두되 개수가 적으면 칸을 넓게 쓰도록 열 수를 개수에 맞춘다.
 */
const Metrics = ({ items }: { items: PortfolioProject["metrics"] }) => {
  const cols =
    items.length >= 4 ? "sm:grid-cols-4" : items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line ${cols}`}>
      {items.map((metric) => (
        <div key={metric.label} className="flex flex-col gap-1 bg-base px-4 py-3.5">
          <span className="text-lg font-bold tabular-nums tracking-tight text-txt-main">{metric.value}</span>
          <span className="text-xs text-txt-sub">{metric.label}</span>
        </div>
      ))}
    </div>
  );
};

interface ProjectDetailProps {
  project: PortfolioProject;
  /** 모달은 헤더가 이름을 보여주므로 본문의 태그 줄만. 펼침형은 여기서 전부 그린다 */
  showSummary?: boolean;
}

const ProjectDetail = ({ project, showSummary = true }: ProjectDetailProps) => {
  /* 구분(자사 · 수주 · 사이드)은 이름 옆 배지가 보여주므로 여기서는 카테고리 · 상태만 */
  const meta = [project.category, project.status].filter(Boolean);
  const descriptionLines = toLines(project.description);

  return (
    <div className="flex flex-col gap-6">
      {meta.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {meta.map((one) => (
            <span key={one} className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold text-txt-sub">
              {one}
            </span>
          ))}
        </div>
      )}

      {showSummary && project.summary && (
        <p className="text-[15px] font-medium leading-relaxed text-txt-main">{project.summary}</p>
      )}

      {project.metrics.length > 0 && <Metrics items={project.metrics} />}

      {(project.role || project.team || project.url) && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-line px-5 py-4 text-sm sm:grid-cols-3">
          {project.role && (
            <div className="flex flex-col gap-1">
              <Meta>역할</Meta>
              <span className="text-txt-main">{project.role}</span>
            </div>
          )}
          {project.team && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <Meta>팀</Meta>
              <span className="text-txt-main">{project.team}</span>
            </div>
          )}
          {project.url && (
            <div className="flex min-w-0 flex-col gap-1 sm:col-span-3">
              <Meta>링크</Meta>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 truncate text-txt-sub transition-colors hover:text-txt-main"
              >
                <span className="truncate">{project.url.replace(/^https?:\/\//, "")}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          )}
        </div>
      )}

      {descriptionLines.length > 0 && (
        <Section title="개요">
          <div className="flex flex-col gap-2 text-sm leading-relaxed text-txt-sub">
            {descriptionLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </Section>
      )}

      {project.highlights.length > 0 && (
        <Section title="핵심">
          <Points items={project.highlights} />
        </Section>
      )}
      {project.improvements.length > 0 && (
        <Section title="문제와 개선">
          <Points items={project.improvements} />
        </Section>
      )}

      {project.tech_stack.length > 0 && (
        <Section title="기술 스택">
          <Chips items={project.tech_stack} />
        </Section>
      )}
    </div>
  );
};

export default ProjectDetail;
