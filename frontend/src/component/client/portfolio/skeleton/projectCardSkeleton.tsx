// 역할: ProjectCard 와 같은 골격의 스켈레톤 — 제목/기간 · 소개 2줄 · 기술 칩

import Skeleton from "@/component/client/ui/skeleton";

const ProjectCardSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-2xl border border-line">
    <div className="flex flex-col gap-2.5 px-5 py-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-4 w-10 rounded-md" />
        </div>
        <Skeleton className="h-3 w-1/3" />
      </div>

      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />

      <div className="flex gap-1.5 pt-0.5">
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
    </div>
  </div>
);

export default ProjectCardSkeleton;
