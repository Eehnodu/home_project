// 역할: 대시보드 차트 한 장을 감싸는 카드

import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  /** 무엇을 그린 것인지 한 줄. 단일 계열 차트는 이게 범례를 대신한다 */
  description?: string;
  children: ReactNode;
}

/**
 * 차트 한 장을 감싸는 카드.
 *
 * 계열이 하나인 차트는 범례를 두지 않는다 — 색이 하나뿐이라 제목이 이미
 * 무엇을 그린 것인지 말한다. 범례 상자는 제목을 되풀이하면서 자리만 먹는다.
 */
const ChartCard = ({ title, description, children }: ChartCardProps) => (
  <section className="flex flex-col gap-1 rounded-xl border border-line bg-bg-card p-4">
    <h2 className="text-sm font-semibold text-text-main">{title}</h2>
    {description && <p className="text-xs text-text-sub">{description}</p>}
    <div className="mt-3 h-56 w-full">{children}</div>
  </section>
);

export default ChartCard;
