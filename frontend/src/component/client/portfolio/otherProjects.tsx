// 역할: 상세로 올리지 않은 프로젝트를 이름만 한 줄로 모아 보여주는 칸. 목록은 관리자 Info 편집의 「그 외 프로젝트」

import { useGet } from "@/hooks/common/useAPI";
import type { PortfolioInfo } from "@/types/portfolio";

const OtherProjects = () => {
  const { data } = useGet<PortfolioInfo>("api/portfolio/info", ["portfolio-info"]);
  const items = data?.other_projects ?? [];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-line px-6 py-5">
      <p className="text-xs font-semibold tracking-wide text-txt-sub">그 외 프로젝트</p>
      <div className="flex flex-wrap gap-2">
        {items.map((name) => (
          <span key={name} className="rounded-full bg-surface px-3 py-1 text-xs text-txt-sub">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default OtherProjects;
