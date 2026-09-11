import { Layers } from "lucide-react";
import SectionWrapper from "./sectionWrapper";
import { useGet } from "@/hooks/common/useAPI";
import { mediaUrl } from "@/utils/media";
import type { StackCategory } from "@/types/portfolio";
import TechStackSkeleton from "@/component/client/portfolio/skeleton/techStackSkeleton";

/* 폴백을 두지 않는다. 관리자 화면에서 넣은 값만 그린다 —
   화면에 남아 있는데 DB 에는 없는 상태가 되면 뭐가 반영된 건지 알 수 없다. */
const TechStackSection = () => {
  const { data, isLoading } = useGet<StackCategory[]>("api/portfolio/stack", [
    "portfolio-stack",
  ]);

  const stacks = data ?? [];

  return (
    <SectionWrapper
      id="techstack"
      title="기술 스택"
      subtitle="실제 프로젝트에서 사용해 본 기술입니다."
      icon={Layers}
    >
      {isLoading ? (
        <TechStackSkeleton />
      ) : stacks.length === 0 ? (
        <p className="rounded-2xl border border-line py-12 text-center text-sm text-txt-sub">
          등록된 기술이 없습니다.
        </p>
      ) : (
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
                        <img
                          src={iconSrc}
                          alt=""
                          aria-hidden
                          loading="lazy"
                          className="h-4 w-4 object-contain"
                        />
                      )}
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};

export default TechStackSection;
