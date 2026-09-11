// 역할: Approach 섹션 스켈레톤 — 아이콘 · 번호 · 제목 · 설명 2줄 카드 6개

import Skeleton from "@/component/client/ui/skeleton";

const COUNT = 6;

const ApproachSkeleton = () => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {Array.from({ length: COUNT }).map((_, index) => (
      <div
        key={index}
        className="flex flex-col gap-4 rounded-2xl border border-line px-6 py-5"
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-3 w-6" />
        </div>
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export default ApproachSkeleton;
