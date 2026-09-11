// 역할: 사이드바형 Info 페이지. 왼쪽 프로필 카드 + 오른쪽 소개 · 경력 · 학력 · 자격증 카드. 헤더형 Info 섹션과 같은 데이터를 다른 배치로 그린다

import { ArrowUpRight } from "lucide-react";
import { useGet } from "@/hooks/common/useAPI";
import { mediaUrl } from "@/utils/media";
import type { PortfolioInfo, PortfolioLink } from "@/types/portfolio";
import logo from "@/assets/logo.png";
import Skeleton from "@/component/client/ui/skeleton";

/** 줄바꿈으로 나뉜 텍스트를 문단 배열로 */
const toLines = (text: string) =>
  text.split("\n").map((line) => line.trim()).filter(Boolean);

const renderLinkIcon = (link: PortfolioLink) => {
  const uploaded = mediaUrl(link.icon_image);
  if (!uploaded) return <ArrowUpRight className="h-4 w-4" />;
  return <img src={uploaded} alt="" aria-hidden className="h-4 w-4 object-contain" />;
};

const Card = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 rounded-2xl border border-line px-6 py-5">
    {title && (
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-txt-sub">{title}</p>
    )}
    {children}
  </div>
);

const Entry = ({
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
  <div className="flex flex-col gap-1.5">
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <p className="text-sm font-semibold text-txt-main">{title}</p>
      {period && <p className="text-xs tabular-nums text-txt-muted">{period}</p>}
    </div>
    {sub && <p className="text-xs text-txt-sub">{sub}</p>}
    {items && items.length > 0 && (
      <ul className="mt-1 flex flex-col gap-1 text-[13px] leading-relaxed text-txt-sub">
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

const InfoPageSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-line px-6 py-8">
      <Skeleton className="h-36 w-36 rounded-2xl" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-3 w-20" />
      <div className="flex flex-wrap justify-center gap-2">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-14 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-line px-6 py-5">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="mt-2 h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[3, 1].map((lines, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-2xl border border-line px-6 py-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-1/2" />
            {Array.from({ length: lines }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const InfoPage = () => {
  const { data, isLoading } = useGet<PortfolioInfo>("api/portfolio/info", ["portfolio-info"]);

  if (isLoading || !data) return <InfoPageSkeleton />;

  const profileSrc = mediaUrl(data.profile_image) ?? logo;
  const headlineLines = toLines(data.headline);
  const descriptionLines = toLines(data.description);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      {/* 프로필 카드. 사이드바형에서는 사람이 먼저 보이도록 왼쪽에 고정한다 */}
      <div className="flex flex-col items-center gap-4 self-start rounded-2xl border border-line px-6 py-8 text-center">
        <div className="aspect-square w-36 overflow-hidden rounded-2xl border border-line">
          <img src={profileSrc} alt={`${data.name} 프로필`} className="block h-full w-full object-cover" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold tracking-tight text-txt-main">{data.name}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-txt-sub">
            {data.role_label}
          </p>
        </div>
        {data.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-3 py-1 text-xs font-medium text-txt-sub"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {data.links.length > 0 && (
          <div className="flex w-full flex-col gap-2 pt-2">
            {data.links.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-left transition-colors hover:border-line-active hover:bg-surface"
              >
                <span className="shrink-0 text-txt-sub group-hover:text-txt-main">
                  {renderLinkIcon(link)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-txt-main">{link.label}</span>
                  <span className="block truncate text-[11px] text-txt-sub">{link.sub}</span>
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 오른쪽: 소개 · 경력 · 학력 · 자격증 */}
      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="text-[24px] font-bold leading-[1.3] tracking-tight text-txt-main sm:text-[30px]">
            {headlineLines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h2>
          <div className="flex flex-col gap-1.5 text-[15px] leading-relaxed text-txt-sub">
            {descriptionLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </Card>

        {(data.careers.length > 0 ||
          data.educations.length > 0 ||
          data.certificates.length > 0) && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.careers.length > 0 && (
              <div className="md:col-span-2">
                <Card title="Career">
                  {data.careers.map((career, index) => (
                    <Entry
                      key={index}
                      title={career.org}
                      sub={career.role}
                      period={career.period}
                      items={career.items}
                    />
                  ))}
                </Card>
              </div>
            )}
            {data.educations.length > 0 && (
              <Card title="Education">
                {data.educations.map((edu, index) => (
                  <Entry key={index} title={edu.school} sub={edu.major} period={edu.period} />
                ))}
              </Card>
            )}
            {data.certificates.length > 0 && (
              <Card title="Certificate">
                {data.certificates.map((cert, index) => (
                  <Entry key={index} title={cert.name} sub={cert.issuer} period={cert.date} />
                ))}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPage;
