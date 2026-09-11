// 역할: 프로젝트 상세 모달 — 갤러리 · 설명 · 포인트 · 기술 스택

import { ArrowUpRight } from "lucide-react";
import FormModal from "@/component/client/ui/feedback/formModal";
import { formatPeriod } from "@/utils/format/date";
import type { PortfolioProject, ProjectPoint } from "@/types/portfolio";

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: PortfolioProject | null;
}

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
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3 border-t border-line pt-5">
    <Label>{title}</Label>
    {children}
  </section>
);

/** 역할·팀·링크처럼 카드 안의 작은 항목 이름 */
const Meta = ({ children }: { children: string }) => (
  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-txt-muted">
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
          {item.title && (
            <p className="text-sm font-semibold text-txt-main">{item.title}</p>
          )}
          {item.body && (
            <p className="text-sm leading-relaxed text-txt-sub">{item.body}</p>
          )}
        </div>
      </li>
    ))}
  </ul>
);

const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <span
        key={item}
        className="rounded-full border border-line px-3 py-1 text-xs text-txt-sub"
      >
        {item}
      </span>
    ))}
  </div>
);


const ProjectModal = ({ open, onClose, project }: ProjectModalProps) => {
  if (!project) return null;

  const meta = [project.kind, project.category, project.status].filter(Boolean);
  const descriptionLines = toLines(project.description);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      headerType="left"
      title={project.name}
      description={formatPeriod(project.start_date, project.end_date)}
      size="lg"
      className="!max-w-3xl"
      footerType={0}
    >
      <div className="flex flex-col gap-6 py-2">
        {/* 구분 · 카테고리 · 상태 */}
        {meta.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {meta.map((one) => (
              <span
                key={one}
                className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold text-txt-sub"
              >
                {one}
              </span>
            ))}
          </div>
        )}


        {/* 한 줄 소개 */}
        {project.summary && (
          <p className="text-[15px] font-medium leading-relaxed text-txt-main">
            {project.summary}
          </p>
        )}

        {/* 역할 · 팀 · 링크 — 작은 메타 정보라 섹션 제목 대신 소제목으로 */}
        {(project.role || project.team || project.url) && (
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-line px-5 py-4 text-sm sm:grid-cols-3">
            {project.role && (
              <div className="flex flex-col gap-1">
                <Meta>Role</Meta>
                <span className="text-txt-main">{project.role}</span>
              </div>
            )}
            {project.team && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Meta>Team</Meta>
                <span className="text-txt-main">{project.team}</span>
              </div>
            )}
            {project.url && (
              <div className="flex min-w-0 flex-col gap-1 sm:col-span-3">
                <Meta>Link</Meta>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 truncate text-txt-sub transition-colors hover:text-txt-main"
                >
                  <span className="truncate">
                    {project.url.replace(/^https?:\/\//, "")}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* 상세 설명 */}
        {descriptionLines.length > 0 && (
          <Section title="About">
            <div className="flex flex-col gap-2 text-sm leading-relaxed text-txt-sub">
              {descriptionLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </Section>
        )}

        {/* 핵심 · 기능 · 문제와 개선 — 노션 프로젝트 페이지와 같은 순서 */}
        {project.highlights.length > 0 && (
          <Section title="Highlights">
            <Points items={project.highlights} />
          </Section>
        )}
        {project.features.length > 0 && (
          <Section title="Features">
            <Points items={project.features} />
          </Section>
        )}
        {project.improvements.length > 0 && (
          <Section title="Problems & Improvements">
            <Points items={project.improvements} />
          </Section>
        )}

        {/* 기술 스택 · 외부 연동 · 태그 */}
        {project.tech_stack.length > 0 && (
          <Section title="Tech Stack">
            <Chips items={project.tech_stack} />
          </Section>
        )}
        {project.integrations.length > 0 && (
          <Section title="Integrations">
            <Chips items={project.integrations} />
          </Section>
        )}
        {project.tags.length > 0 && (
          <Section title="Tags">
            <Chips items={project.tags} />
          </Section>
        )}
      </div>
    </FormModal>
  );
};

export default ProjectModal;
