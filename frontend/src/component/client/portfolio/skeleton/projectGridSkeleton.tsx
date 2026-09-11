// 역할: 프로젝트 카드 격자 스켈레톤 — 메인 섹션(2열 4개)과 목록 페이지(3열)가 열 수만 다르게 쓴다

import ProjectCardSkeleton from "./projectCardSkeleton";

interface ProjectGridSkeletonProps {
  count?: number;
  /** 실제 격자와 같은 grid 클래스를 넘긴다. 열 수가 다르면 데이터가 온 뒤 카드가 재배치된다 */
  className?: string;
}

const ProjectGridSkeleton = ({
  count = 4,
  className = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
}: ProjectGridSkeletonProps) => (
  <div className={className}>
    {Array.from({ length: count }).map((_, index) => (
      <ProjectCardSkeleton key={index} />
    ))}
  </div>
);

export default ProjectGridSkeleton;
