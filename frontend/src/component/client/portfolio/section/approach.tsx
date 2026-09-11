import { Lightbulb } from "lucide-react";
import SectionWrapper from "./sectionWrapper";
import { resolveApproachIcon } from "@/component/client/portfolio/approachIcons";
import { useGet } from "@/hooks/common/useAPI";
import type { ApproachCard } from "@/types/portfolio";
import ApproachSkeleton from "@/component/client/portfolio/skeleton/approachSkeleton";

/** DB 가 비어 있거나 API 가 실패해도 화면이 비지 않도록 쓰는 기본값 */
const FALLBACK: ApproachCard[] = [
  {
    icon: "zap",
    title: "실패를 전제한 외부 연동",
    description:
      "OpenAI · Gemini · ElevenLabs · HeyGen · FCM 같은 AI · 음성 · 실시간 서비스를 연동해 왔습니다. 외부 서비스 하나가 장애를 일으켜도 기능이 유지되도록 폴백을 두고 설계합니다.",
  },
  {
    icon: "layers",
    title: "반복에서 다듬은 구조",
    description:
      "같은 종류의 프로젝트를 반복하는 동안 불편했던 지점을 하나씩 고쳤습니다. 파일 하나에 모든 로직을 두던 구조는 도메인 단위 모듈로, 세션 폴링은 SSE 스트리밍으로 바꿨고, 반복되는 인증 · 로깅 · 공통 UI 는 템플릿으로 남겨 다음 프로젝트에 재사용합니다.",
  },
  {
    icon: "cursor",
    title: "사용자 흐름 중심의 설계",
    description:
      "기능 목록이 아니라 사용자가 실제로 겪는 흐름 단위로 화면과 API 를 설계합니다. 로딩 중일 때와 오류가 났을 때 무엇이 보이고 무엇을 할 수 있는지를 정상 화면과 같은 비중으로 다룹니다.",
  },
  {
    icon: "wrench",
    title: "운영을 전제한 로그",
    description:
      "요청마다 고유 ID 를 붙여 그 요청이 남긴 로그를 처음부터 끝까지 따라갈 수 있게 합니다. 외부 연동과 워커처럼 양이 많은 로그는 전용 파일로 나눠, 장애가 나면 한 파일만 열어 보면 되게 합니다.",
  },
];

const ApproachSection = () => {
  const { data, isLoading } = useGet<ApproachCard[]>("api/portfolio/approach", [
    "portfolio-approach",
  ]);

  const approaches = data?.length ? data : FALLBACK;

  return (
    <SectionWrapper
      id="approach"
      title="설계 원칙"
      subtitle="설계할 때 기준으로 삼는 원칙입니다."
      icon={Lightbulb}
    >
      {isLoading ? (
        <ApproachSkeleton />
      ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {approaches.map((item, index) => {
          const Icon = resolveApproachIcon(item.icon);
          return (
            <div
              key={item.id ?? item.title}
              className="group flex flex-col gap-4 rounded-2xl border border-line px-6 py-5 transition-colors hover:border-line-active hover:bg-surface"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-txt-sub transition-colors group-hover:text-txt-main">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-xs font-semibold tabular-nums text-txt-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold tracking-tight text-txt-main">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-txt-sub">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </SectionWrapper>
  );
};

export default ApproachSection;
