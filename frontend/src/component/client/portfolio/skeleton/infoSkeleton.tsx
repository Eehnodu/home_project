// 역할: Info 섹션 스켈레톤 — 프로필 이미지 · 헤드라인 · 소개 · 태그 · 링크 카드

import Skeleton from "@/component/client/ui/skeleton";

const InfoSkeleton = () => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
      {/* 프로필. 실제 화면과 같이 모바일은 작은 아바타 + 이름, md 이상은 큰 정사각형 */}
      <div className="flex items-center gap-4 md:block md:shrink-0">
        <Skeleton className="aspect-square w-20 shrink-0 rounded-2xl md:w-60 lg:w-64" />
        <div className="flex flex-col gap-2 md:hidden">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <Skeleton className="hidden h-3 w-28 md:block" />

        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-4/5 sm:h-11" />
          <Skeleton className="h-8 w-3/5 sm:h-11" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-2xl border border-line px-5 py-4"
        >
          <Skeleton className="h-5 w-5 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-4 w-4 rounded-md" />
        </div>
      ))}
    </div>

    {/* 경력 · 학력 · 자격증 세 칸 */}
    <div className="grid grid-cols-1 gap-6 border-t border-line pt-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
      {[3, 1, 1].map((lines, column) => (
        <div key={column} className="flex flex-col gap-3">
          <Skeleton className="h-3 w-20" />
          <div className="flex flex-col gap-2 rounded-2xl border border-line px-5 py-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton key={index} className="mt-1 h-3 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default InfoSkeleton;
