// 역할: Tech Stack 섹션 스켈레톤 — 카테고리 라벨 + 기술 칩 줄

import Skeleton from "@/component/client/ui/skeleton";

/* 줄마다 칩 수와 폭을 다르게 둔다. 전부 같으면 표처럼 보여 실제 화면과 어긋난다 */
const ROWS: string[][] = [
  ["w-24", "w-20", "w-28", "w-16", "w-24"],
  ["w-20", "w-24", "w-16", "w-20"],
  ["w-28", "w-20", "w-24", "w-20", "w-16", "w-24"],
  ["w-20", "w-16", "w-24"],
];

const TechStackSkeleton = () => (
  <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line">
    {ROWS.map((chips, row) => (
      <div
        key={row}
        className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:gap-6"
      >
        <Skeleton className="h-3 w-16 shrink-0 sm:w-20" />
        <div className="flex flex-wrap gap-2">
          {chips.map((width, index) => (
            <Skeleton key={index} className={`h-8 rounded-xl ${width}`} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default TechStackSkeleton;
