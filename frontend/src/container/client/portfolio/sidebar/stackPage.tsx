// 역할: 사이드바형 Tech Stack 페이지. 헤더형 섹션과 같은 가로 줄 목록 — 왼쪽 묶음 이름, 오른쪽 기술 칩

import { useGet } from "@/hooks/common/useAPI";
import { mediaUrl } from "@/utils/media";
import type { StackCategory } from "@/types/portfolio";
import Skeleton from "@/component/client/ui/skeleton";

const SKELETON_ROWS: string[][] = [
  ["w-24", "w-20", "w-28", "w-16", "w-24", "w-20"],
  ["w-20", "w-24", "w-16", "w-20"],
  ["w-28", "w-20", "w-24"],
  ["w-20", "w-16", "w-24", "w-20", "w-16"],
];

const StackPageSkeleton = () => (
  <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line">
    {SKELETON_ROWS.map((chips, row) => (
      <div key={row} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:gap-6">
        <Skeleton className="h-3 w-16 shrink-0 sm:w-24" />
        <div className="flex flex-wrap gap-2">
          {chips.map((width, index) => (
            <Skeleton key={index} className={`h-9 rounded-xl ${width}`} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const StackPage = () => {
  const { data, isLoading } = useGet<StackCategory[]>("api/portfolio/stack", ["portfolio-stack"]);

  if (isLoading) return <StackPageSkeleton />;

  const stacks = data ?? [];
  if (stacks.length === 0) {
    return (
      <p className="rounded-2xl border border-line py-12 text-center text-sm text-txt-sub">
        등록된 기술이 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line">
      {stacks.map((stack) => (
        <div
          key={stack.id ?? stack.name}
          className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:gap-6"
        >
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.15em] text-txt-sub sm:w-24">
            {stack.name}
          </span>
          <div className="flex flex-wrap gap-2">
            {stack.items.map((item) => {
              const iconSrc = mediaUrl(item.icon_image);
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-xl border border-line px-3 py-1.5 text-sm text-txt-main transition-colors hover:border-line-active hover:bg-surface"
                >
                  {iconSrc && (
                    <img src={iconSrc} alt="" aria-hidden loading="lazy" className="h-4 w-4 object-contain" />
                  )}
                  <span>{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StackPage;
