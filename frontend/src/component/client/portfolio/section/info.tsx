import { User, ArrowUpRight } from "lucide-react";
import SectionWrapper from "./sectionWrapper";
import { useGet } from "@/hooks/common/useAPI";
import { mediaUrl } from "@/utils/media";
import type { PortfolioInfo, PortfolioLink } from "@/types/portfolio";
import logo from "@/assets/logo.png";
import InfoSkeleton from "@/component/client/portfolio/skeleton/infoSkeleton";

/** DB 가 비어 있거나 API 가 실패해도 화면이 비지 않도록 쓰는 기본값 */
const FALLBACK: PortfolioInfo = {
  subtitle: "저에 대한 소개입니다.",
  role_label: "Web Developer",
  name: "Nodu",
  headline: "심플하지만, 확실하게 동작하는\n개발을 지향합니다.",
  description:
    "백엔드와 프론트엔드를 함께 다루며, 필요한 기능을 스스로 만들어가는 과정을 좋아합니다.\n정리된 구조와 깔끔한 코드를 추구하며, 유지보수가 쉬운 방식으로 개발합니다.",
  profile_image: null,
  tags: ["Backend", "Frontend", "Server", "Clean Code"],
  links: [
    {
      label: "GitHub",
      sub: "github.com/Eehnodu",
      href: "https://github.com/Eehnodu",
      icon_image: null,
    },
    {
      label: "Tistory",
      sub: "eehnodu.tistory.com",
      href: "https://eehnodu.tistory.com/",
      icon_image: null,
    },
  ],
  careers: [],
  educations: [],
  certificates: [],
  layout: "header",
};

/** 경력 · 학력 · 자격증 한 칸. 제목 아래 항목 카드가 세로로 쌓인다 */
const RecordColumn = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-txt-sub">
      {title}
    </p>
    <div className="flex flex-col gap-3">{children}</div>
  </div>
);

const RecordCard = ({
  title,
  sub,
  period,
  items,
}: {
  title: string;
  sub?: string;
  period?: string;
  items?: string[];
}) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-line px-5 py-4">
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-semibold text-txt-main">{title}</p>
      {sub && <p className="text-xs text-txt-sub">{sub}</p>}
      {period && (
        <p className="text-xs tabular-nums text-txt-muted">{period}</p>
      )}
    </div>
    {items && items.length > 0 && (
      <ul className="flex flex-col gap-1 text-[13px] leading-relaxed text-txt-sub">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-txt-muted" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

/** 업로드한 아이콘이 있으면 그걸 쓰고, 없으면 기본 화살표 */
const renderLinkIcon = (link: PortfolioLink) => {
  const uploaded = mediaUrl(link.icon_image);
  if (!uploaded) return <ArrowUpRight className="h-5 w-5" />;

  return (
    <img src={uploaded} alt="" aria-hidden className="h-5 w-5 object-contain" />
  );
};

/** 줄바꿈으로 나뉜 텍스트를 문단 배열로 */
const toLines = (text: string) =>
  text.split("\n").map((line) => line.trim()).filter(Boolean);

const InfoSection = () => {
  const { data, isLoading } = useGet<PortfolioInfo>("api/portfolio/info", [
    "portfolio-info",
  ]);

  /* 저장된 값이 비어 있으면 기본값으로 채운다 — 관리자가 아직 안 채운 항목만 대체 */
  const info: PortfolioInfo = {
    ...FALLBACK,
    ...data,
    tags: data?.tags?.length ? data.tags : FALLBACK.tags,
    links: data?.links?.length ? data.links : FALLBACK.links,
    careers: data?.careers ?? [],
    educations: data?.educations ?? [],
    certificates: data?.certificates ?? [],
    headline: data?.headline || FALLBACK.headline,
    description: data?.description || FALLBACK.description,
  };

  const profileSrc = mediaUrl(info.profile_image) ?? logo;
  const headlineLines = toLines(info.headline);
  const descriptionLines = toLines(info.description);

  const roleLabel = (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-txt-sub">
      {info.role_label}
    </p>
  );

  return (
    <SectionWrapper
      id="info"
      title="Info"
      subtitle={info.subtitle}
      icon={User}
      showBorder={false}
    >
      {/* 첫 조회 동안은 기본값을 잠깐 보여주고 실제 값으로 바꾸는 대신 뼈대를 그린다.
          기본값이 먼저 보이면 내용이 두 번 바뀌어 화면이 튄다 */}
      {isLoading ? (
        <InfoSkeleton />
      ) : (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          {/* 프로필 + 이름
              모바일에서는 큰 이미지가 혼자 한 덩어리로 떠 보이므로
              작은 아바타로 줄여 라벨과 한 줄로 묶는다.
              md 이상에서는 텍스트 왼쪽의 큰 정사각형으로 돌아간다. */}
          <div className="flex items-center gap-4 md:block md:shrink-0">
            {/* 배경색을 깔지 않는다. 로고 PNG 모서리가 투명해서
                밝은 배경을 깔면 라운드 모서리로 배경이 비쳐 보인다. */}
            <div className="aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border border-line md:w-60 lg:w-64">
              <img
                src={profileSrc}
                alt={`${info.name} 프로필`}
                className="block h-full w-full object-cover"
              />
            </div>

            {/* 모바일 전용: 아바타 옆 이름/직무 */}
            <div className="flex flex-col gap-1 md:hidden">
              {roleLabel}
              <p className="text-xl font-bold tracking-tight text-txt-main">
                {info.name}
              </p>
            </div>
          </div>

          {/* 텍스트 */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {/* 데스크탑 전용: 큰 이미지 오른쪽 상단 라벨 */}
            <div className="hidden md:block">{roleLabel}</div>

            <h3 className="text-[26px] font-bold leading-[1.3] tracking-tight text-txt-main sm:text-[40px]">
              {headlineLines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </h3>

            <div className="flex flex-col gap-1.5 text-[15px] leading-relaxed text-txt-sub">
              {descriptionLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {info.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-txt-sub"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 링크 카드 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {info.links.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-line px-5 py-4 transition-colors hover:border-line-active hover:bg-surface"
            >
              <span className="shrink-0 text-txt-sub transition-colors group-hover:text-txt-main">
                {renderLinkIcon(link)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-txt-main">
                  {link.label}
                </p>
                <p className="truncate text-xs text-txt-sub">{link.sub}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-txt-muted transition-colors group-hover:text-txt-main" />
            </a>
          ))}
        </div>

        {/* 경력 · 학력 · 자격증. 값이 있는 칸만 그리고, 경력은 항목이 길어 넓은 칸을 차지한다 */}
        {(info.careers.length > 0 ||
          info.educations.length > 0 ||
          info.certificates.length > 0) && (
          <div className="grid grid-cols-1 gap-6 border-t border-line pt-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
            {info.careers.length > 0 && (
              <RecordColumn title="Career">
                {info.careers.map((career, index) => (
                  <RecordCard
                    key={index}
                    title={career.org}
                    sub={career.role}
                    period={career.period}
                    items={career.items}
                  />
                ))}
              </RecordColumn>
            )}
            {info.educations.length > 0 && (
              <RecordColumn title="Education">
                {info.educations.map((edu, index) => (
                  <RecordCard
                    key={index}
                    title={edu.school}
                    sub={edu.major}
                    period={edu.period}
                  />
                ))}
              </RecordColumn>
            )}
            {info.certificates.length > 0 && (
              <RecordColumn title="Certificate">
                {info.certificates.map((cert, index) => (
                  <RecordCard
                    key={index}
                    title={cert.name}
                    sub={cert.issuer}
                    period={cert.date}
                  />
                ))}
              </RecordColumn>
            )}
          </div>
        )}
      </div>
      )}
    </SectionWrapper>
  );
};

export default InfoSection;
