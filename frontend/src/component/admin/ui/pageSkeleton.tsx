// 역할: 관리자 페이지 공통 스켈레톤. 화면 종류(표 · 폼 · 차트)에 맞는 골격을 그린다

import Skeleton from "./skeleton";

type Variant = "table" | "form" | "chart";

interface PageSkeletonProps {
  /**
   * table: 도구 줄 + 표
   * form : 저장 버튼 줄 + 카드형 입력 묶음
   * chart: 필터 줄 + 요약 박스 4개 + 큰 차트 + 작은 차트 2개
   */
  variant?: Variant;
  /** table 의 행 수, form 의 카드 수 */
  rows?: number;
}

const TableSkeleton = ({ rows }: { rows: number }) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
      <Skeleton className="h-10 w-full md:w-56" />
      <Skeleton className="h-10 w-36" />
      <Skeleton className="ml-auto h-10 w-24" />
    </div>
    <div className="overflow-hidden rounded-xl border border-line">
      <Skeleton className="h-11 w-full rounded-none" />
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-3.5 w-8" />
            <Skeleton className="h-3.5 w-1/4" />
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="ml-auto h-3.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FormSkeleton = ({ rows }: { rows: number }) => (
  <div className="flex flex-col gap-5 pb-10">
    <div className="flex items-center justify-end gap-2">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className="flex flex-col gap-4 rounded-xl border border-line bg-bg-card p-5"
      >
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-10 w-28" />
      <Skeleton className="h-10 w-56" />
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-xl border border-line bg-bg-card p-4"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
    <Skeleton className="h-64 w-full rounded-xl" />
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Skeleton className="h-52 w-full rounded-xl" />
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
  </div>
);

/* 첫 조회(isLoading)에만 쓴다. 저장·삭제처럼 조작을 막아야 하는 대기는 Loading 오버레이가 맡는다 */
const PageSkeleton = ({ variant = "table", rows = 8 }: PageSkeletonProps) => {
  if (variant === "form") return <FormSkeleton rows={Math.min(rows, 3)} />;
  if (variant === "chart") return <ChartSkeleton />;
  return <TableSkeleton rows={rows} />;
};

export default PageSkeleton;
