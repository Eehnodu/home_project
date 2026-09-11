// 역할: 전체 프로젝트 목록 페이지. 카테고리 칩으로 걸러 보고 카드를 누르면 상세 모달

import { useMemo, useState } from "react";
import ProjectCard from "@/component/client/portfolio/projectCard";
import ProjectModal from "@/component/client/portfolio/modal/projectModal";
import { CONTAINER } from "@/component/client/portfolio/layout";
import { useGet } from "@/hooks/common/useAPI";
import type { PortfolioProject } from "@/types/portfolio";
import ProjectGridSkeleton from "@/component/client/portfolio/skeleton/projectGridSkeleton";
import { usePortfolioLayout } from "@/container/client/portfolio/layout";
import Skeleton from "@/component/client/ui/skeleton";

const ALL = "전체";

/** 값 순서를 유지하며 중복만 걷어낸다 — 필터 칩 순서가 데이터 순서를 따라가게 */
const unique = (values: string[]) =>
  values.filter((value, index) => value && values.indexOf(value) === index);

const FilterChips = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {[ALL, ...options].map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          value === option
            ? "border-line-active bg-surface text-txt-main"
            : "border-line text-txt-sub hover:text-txt-main"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

const ProjectListPage = () => {
  const { data, isLoading } = useGet<PortfolioProject[]>(
    "api/portfolio/project",
    ["portfolio-project"],
  );
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const [category, setCategory] = useState(ALL);
  const sidebar = usePortfolioLayout() === "sidebar";

  const projects = data ?? [];

  /* 필터는 카테고리 하나만 둔다. 자사/SI 구분은 카드의 배지로 충분하다 */
  const categories = useMemo(
    () => unique(projects.map((one) => one.category)),
    [projects],
  );

  const filtered = projects.filter(
    (one) => category === ALL || one.category === category,
  );

  /* 헤더·배경·챗봇은 PortfolioLayout 이 그린다 */
  return (
    <>
      <main className={sidebar ? "" : `${CONTAINER} py-10`}>
        {/* 사이드바형은 껍데기가 페이지 전체에 등장 애니메이션을 걸므로 여기서 또 걸지 않는다 */}
        <div className={`flex flex-col gap-8 ${sidebar ? "" : "reveal is-visible"}`}>
          {/* 상단. 사이드바형은 헤더가 페이지 이름을 보여주므로 생략 */}
          {!sidebar && (
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-txt-main">
                Projects
              </h1>
              <p className="text-sm text-txt-sub">
                진행한 프로젝트들을 정리했습니다.
              </p>
            </div>
          )}

          {/* 카테고리 필터. 항목이 하나뿐이면 굳이 보여주지 않는다 */}
          {categories.length > 1 && (
            <FilterChips
              options={categories}
              value={category}
              onChange={setCategory}
            />
          )}

          {/* 필터 칩 자리. 로딩 중 칩이 없으면 격자가 위로 붙었다가 데이터가 오면 아래로 밀린다 */}
          {isLoading && (
            <div className="flex flex-wrap gap-1.5">
              {["w-12", "w-16", "w-20", "w-14", "w-24"].map((width) => (
                <Skeleton key={width} className={`h-[26px] rounded-full ${width}`} />
              ))}
            </div>
          )}

          {isLoading ? (
            <ProjectGridSkeleton
              count={6}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3"
            />
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id ?? project.name}
                  project={project}
                  onClick={setSelected}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-line py-12 text-center text-sm text-txt-sub">
              {projects.length === 0
                ? "등록된 프로젝트가 없습니다."
                : "조건에 맞는 프로젝트가 없습니다."}
            </p>
          )}
        </div>
      </main>

      <ProjectModal
        open={!!selected}
        onClose={() => setSelected(null)}
        project={selected}
      />
    </>
  );
};

export default ProjectListPage;
