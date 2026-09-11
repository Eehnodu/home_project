// 역할: 사이드바형 Approach 페이지. 헤더형의 2열 카드 대신 번호가 붙은 세로 목록으로 읽어 내려가게 한다

import { resolveApproachIcon } from "@/component/client/portfolio/approachIcons";
import { useGet } from "@/hooks/common/useAPI";
import type { ApproachCard } from "@/types/portfolio";
import Skeleton from "@/component/client/ui/skeleton";

const ApproachPageSkeleton = () => (
  <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex gap-5 px-6 py-5">
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

const ApproachPage = () => {
  const { data, isLoading } = useGet<ApproachCard[]>("api/portfolio/approach", ["portfolio-approach"]);

  if (isLoading) return <ApproachPageSkeleton />;

  const approaches = data ?? [];
  if (approaches.length === 0) {
    return (
      <p className="rounded-2xl border border-line py-12 text-center text-sm text-txt-sub">
        등록된 원칙이 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line">
      {approaches.map((item, index) => {
        const Icon = resolveApproachIcon(item.icon);
        return (
          <div
            key={item.id ?? item.title}
            className="group flex gap-5 px-6 py-5 transition-colors hover:bg-surface"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-txt-sub transition-colors group-hover:text-txt-main">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-semibold tabular-nums text-txt-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-bold tracking-tight text-txt-main">{item.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-txt-sub">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApproachPage;
