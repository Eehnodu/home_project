// 역할: 프로젝트 이름 옆의 구분 배지(자사 · 수주 · 사이드). 둥근 알약 모양 하나

import { kindLabel } from "@/utils/project";

const KindBadge = ({ kind }: { kind: string }) => {
  if (!kind) return null;
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-line px-2.5 py-0.5 text-[11px] font-semibold leading-none text-txt-sub">
      {kindLabel(kind)}
    </span>
  );
};

export default KindBadge;
