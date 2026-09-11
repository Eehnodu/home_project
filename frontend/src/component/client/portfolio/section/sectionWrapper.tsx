// 역할: 포트폴리오 섹션 공통 틀 — 제목 · 부제 · 스크롤 진입 애니메이션

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { useScrollReveal } from "@/hooks/common/useScrollReveal";

interface SectionProps {
  id: string;
  title: string;
  subtitle?: string;
  subtitleRight?: ReactNode;
  icon: LucideIcon;
  children: ReactNode;
  showBorder?: boolean;
}

const SectionWrapper = ({
  id,
  title,
  subtitle,
  subtitleRight,
  icon: Icon,
  children,
  showBorder = true,
}: SectionProps) => {
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id={id}
      /* 콘텐츠를 상단 정렬해 모든 섹션의 시작 지점을 동일하게 맞춘다.
         (가운데 정렬은 섹션마다 콘텐츠 높이가 달라 시작점이 어긋난다)
         min-h 는 100svh - 헤더(4rem). svh 를 쓰면 모바일 주소창이 접히고 펼쳐질 때
         섹션 높이가 튀지 않는다. 남는 아래 여백은 그대로 둔다. */
      className={`flex min-h-[calc(100svh-4rem)] scroll-mt-16 flex-col justify-start pb-16 pt-8 sm:pb-20 sm:pt-14 ${
        showBorder ? "border-t border-line" : ""
      }`}
    >
      <div ref={revealRef} className="reveal flex flex-col gap-8">
        {/* 섹션 헤더 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-txt-main">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-txt-main">
              {title}
            </h2>
          </div>
          {(subtitle || subtitleRight) && (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              {subtitle && (
                <p className="text-[15px] leading-relaxed text-txt-sub">
                  {subtitle}
                </p>
              )}
              {subtitleRight}
            </div>
          )}
        </div>

        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;
