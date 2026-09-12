// 역할: 관리자 — 챗봇 사용 통계 대시보드. 집계 단위(일/주/월)와 기간을 골라 recharts 로 그린다

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "@/component/admin/dashboard/chartCard";
import Calendar, { type RangeValue } from "@/component/admin/ui/form/calendar";
import PageSkeleton from "@/component/admin/ui/pageSkeleton";
import { useGet } from "@/hooks/common/useAPI";
import type { DashboardStats, StatsUnit } from "@/types/admin/dashboard";

/* 이 버튼은 조회 기간이 아니라 막대 하나가 며칠을 묶는지(집계 단위)를 고른다.
   "일간·주간·월간" 은 기간으로 읽혀 오해를 사므로 "일별·주별·월별" 로 적는다.
   title 에는 그 단위가 기본으로 보는 기간을 적어 둔다. */
const UNITS: { value: StatsUnit; label: string; hint: string }[] = [
  { value: "day", label: "일별", hint: "하루씩 · 최근 14일" },
  { value: "week", label: "주별", hint: "한 주씩 · 최근 12주" },
  { value: "month", label: "월별", hint: "한 달씩 · 최근 12개월" },
];

/**
 * 그 단위의 기본 기간 (오늘까지). 12칸이 보이게 잡는다.
 *
 * 단위만 바꿨을 때 기간이 그대로면 쓸모없는 화면이 된다 — 14일 구간에서
 * 월간을 고르면 칸이 하나뿐이다. 그래서 단위를 바꾸면 이 기간으로 함께 옮긴다.
 * 그 뒤 사용자가 Calendar 로 고른 기간은 다음에 단위를 바꿀 때까지 유지된다.
 *
 * 시작을 단위 경계(주간=월요일, 월간=1일)에 맞춘다. 그냥 며칠 전으로 빼면
 * 첫 칸이 라벨이 가리키는 기간의 일부만 담은 반쪽이 되고 칸 수도 하나 늘어난다.
 */
const defaultRange = (unit: StatsUnit): RangeValue => {
  const end = new Date();
  const start = new Date();

  if (unit === "week") {
    /* 이번 주 월요일에서 11주 전 → 이번 주까지 12칸.
       getDay() 는 일요일이 0 이라 월요일 기준으로 돌려 쓴다 */
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 7 * 11);
  } else if (unit === "month") {
    /* 이번 달 1일에서 11개월 전 → 이번 달까지 12칸 */
    start.setDate(1);
    start.setMonth(start.getMonth() - 11);
  } else {
    start.setDate(start.getDate() - 13); // 오늘 포함 14일
  }

  return { start, end };
};

/** 막대 하나가 묶는 크기. 필터 줄에 적어 기간과 단위를 헷갈리지 않게 한다 */
const UNIT_STEP: Record<StatsUnit, string> = {
  day: "하루",
  week: "한 주",
  month: "한 달",
};

/** Date → "YYYY-MM-DD" (로컬 기준. toISOString 은 UTC 로 밀려 하루 어긋난다) */
const isoDate = (value: Date | null) => {
  if (!value) return "";
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
};

/** 칸 이름을 축에 쓸 짧은 글자로. 단위마다 읽는 방식이 다르다 */
const bucketLabel = (iso: string, unit: StatsUnit) => {
  if (unit === "month") return iso.slice(0, 7).replace("-", ".");
  const short = iso.slice(5).replace("-", ".");
  return unit === "week" ? `${short} 주` : short;
};

/**
 * 차트 색.
 *
 * 어드민 테마는 zinc 단색이라 계열 색이 없다. 검증된 팔레트의 앞 두 슬롯
 * (파랑 · 주황)을 쓴다 — 라이트/다크 각각 대비 · 색약 분리 검사를 통과한 값이다.
 * 계열이 하나인 차트가 대부분이라 실제로 쓰는 건 파랑 하나다.
 */
const SERIES = { light: "#2a78d6", dark: "#3987e5" };
const MUTED = { light: "#a1a1aa", dark: "#52525b" };

/** 축·격자·글자는 테마 토큰을 따라간다. 데이터만 색을 갖는다 */
const useChartTheme = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains("dark"));
    read();
    /* 테마 토글은 html 클래스를 바꾼다. 그때 차트 색도 같이 따라가야 한다 */
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return {
    series: dark ? SERIES.dark : SERIES.light,
    muted: dark ? MUTED.dark : MUTED.light,
    grid: dark ? "#3f3f46" : "#e4e4e7",
    text: dark ? "#a1a1aa" : "#71717a",
    surface: dark ? "#18181b" : "#ffffff",
  };
};

interface TileProps {
  label: string;
  value: string;
  hint?: string;
}

/** 수치 하나는 차트로 그리지 않는다 — 큰 숫자가 더 빨리 읽힌다 */
const Tile = ({ label, value, hint }: TileProps) => (
  <div className="flex flex-col gap-1 rounded-xl border border-line bg-bg-card p-4">
    <p className="text-xs text-text-sub">{label}</p>
    <p className="text-2xl font-semibold tabular-nums text-text-main">{value}</p>
    {hint && <p className="text-xs text-text-sub">{hint}</p>}
  </div>
);

const tooltipStyle = (theme: ReturnType<typeof useChartTheme>) => ({
  contentStyle: {
    background: theme.surface,
    border: `1px solid ${theme.grid}`,
    borderRadius: 8,
    fontSize: 12,
    color: theme.text,
  },
  labelStyle: { color: theme.text },
  itemStyle: { color: theme.text },
  /* recharts 기본 hover 배경은 밝은 회색(#ccc)이라 다크에서 칸을 하얗게 덮는다.
     테마 격자색을 옅게 깔아 어느 칸에 있는지만 알려준다 */
  cursor: { fill: theme.grid, fillOpacity: 0.35 },
});

const AdminChatbotStatsPage = () => {
  const theme = useChartTheme();

  const [unit, setUnit] = useState<StatsUnit>("day");
  const [range, setRange] = useState<RangeValue>(() => defaultRange("day"));

  /** 단위를 바꾸면 기간도 그 단위에 맞게 옮긴다 */
  const handleUnit = (next: StatsUnit) => {
    setUnit(next);
    setRange(defaultRange(next));
  };

  /* Calendar 의 취소는 값을 비운다. 그때는 단위 기본 기간으로 되돌린다 —
     기간이 비면 무엇을 보고 있는지 알 수 없다 */
  const effective = range.start && range.end ? range : defaultRange(unit);
  const from = isoDate(effective.start);
  const to = isoDate(effective.end);
  const query = `unit=${unit}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`;

  /* 기간 · 단위가 쿼리키에 들어가야 필터를 바꿀 때 다시 불러온다 */
  const { data, isLoading } = useGet<DashboardStats>(
    `api/chatbot/stats?${query}`,
    ["chatbot-stats", query],
  );

  const label = (value: string) => bucketLabel(value, unit);

  if (isLoading || !data) return <PageSkeleton variant="chart" />;

  const { totals, series, tools, categories } = data;
  const seconds = (totals.avg_latency_ms / 1000).toFixed(1);
  const tickSkip = series.length > 10 ? 1 : 0;
  const spanText = `${data.range.from.replace(/-/g, ".")} ~ ${data.range.to.replace(/-/g, ".")}`;

  return (
    <div className="flex flex-col gap-4">
      {/* 필터는 차트 위 한 줄에. 세 요소 모두 Calendar 와 같은 h-10 으로 맞춘다 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex h-10 overflow-hidden rounded-md border border-input-border bg-input-bg">
          {UNITS.map((one) => (
            <button
              key={one.value}
              type="button"
              onClick={() => handleUnit(one.value)}
              aria-pressed={unit === one.value}
              title={one.hint}
              className={`px-4 text-sm transition-colors ${
                unit === one.value
                  ? "bg-primary text-bg-card"
                  : "text-text-sub hover:bg-bg-hover hover:text-text-main"
              }`}
            >
              {one.label}
            </button>
          ))}
        </div>

        <Calendar value={range} onChange={setRange} />

        {/* 지금 무엇을 보고 있는지 — 막대 하나의 크기와 전체 기간.
            단위만 보고 기간을 짐작하게 두면 "기간이 제각각" 으로 읽힌다 */}
        <span className="ml-auto flex h-10 shrink-0 items-center gap-2 whitespace-nowrap text-sm text-text-sub">
          <span>막대 하나 = {UNIT_STEP[unit]}</span>
          <span className="text-text-disabled">·</span>
          <span className="tabular-nums">{spanText}</span>
        </span>
      </div>

      {/* 수치 타일 — 기간을 따른다. 오늘 질문만 항상 오늘 값이다 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="대화"
          value={totals.sessions.toLocaleString()}
          hint={`질문 ${totals.messages.toLocaleString()}건`}
        />
        <Tile
          label="오늘 질문"
          value={totals.today_messages.toLocaleString()}
          hint={totals.errors ? `기간 내 실패 ${totals.errors}건` : "실패 없음"}
        />
        <Tile label="평균 응답" value={`${seconds}초`} hint="질문 접수부터 답변 완료까지" />
        <Tile
          label="질문당 입력 토큰"
          value={totals.avg_prompt_tokens.toLocaleString()}
          hint={`누적 ${(totals.prompt_tokens / 1000).toFixed(1)}K`}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard
          title="기간별 질문 수"
          description="데이터가 없는 칸도 0 으로 표시한다"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid stroke={theme.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tickFormatter={label}
                tick={{ fontSize: 11, fill: theme.text }}
                stroke={theme.grid}
                /* 칸이 많으면 라벨이 겹친다. 열 칸 넘으면 하나씩 건너뛴다 */
                interval={tickSkip}
                minTickGap={8}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: theme.text }}
                stroke={theme.grid}
              />
              <Tooltip
                {...tooltipStyle(theme)}
                labelFormatter={(value) => label(String(value))}
                formatter={(value: number) => [`${value}건`, "질문"]}
              />
              {/* 막대는 24px 를 넘기지 않는다. 남는 폭은 여백으로 둔다 */}
              <Bar
                dataKey="questions"
                fill={theme.series}
                maxBarSize={24}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="함수 사용"
          description="질문마다 DB 조회 함수를 탔는지. 미사용은 컨텍스트만으로 답한 질문이다"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tools}
              layout="vertical"
              margin={{ top: 8, right: 28, bottom: 0, left: 8 }}
            >
              <CartesianGrid stroke={theme.grid} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: theme.text }}
                stroke={theme.grid}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={116}
                tick={{ fontSize: 11, fill: theme.text }}
                stroke={theme.grid}
              />
              <Tooltip
                {...tooltipStyle(theme)}
                formatter={(value: number) => [`${value}회`, "호출"]}
              />
              <Bar dataKey="count" maxBarSize={20} radius={[0, 4, 4, 0]}>
                {tools.map((tool) => (
                  /* '미사용' 은 데이터가 아니라 대조군이라 회색으로 뺀다 */
                  <Cell
                    key={tool.name}
                    fill={tool.name === "미사용" ? theme.muted : theme.series}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="카테고리별 프로젝트"
          description={`전체 ${totals.projects}건${
            totals.hidden_projects ? ` (비공개 ${totals.hidden_projects}건 포함)` : ""
          }`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categories}
              layout="vertical"
              margin={{ top: 8, right: 28, bottom: 0, left: 8 }}
            >
              <CartesianGrid stroke={theme.grid} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: theme.text }}
                stroke={theme.grid}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={116}
                tick={{ fontSize: 11, fill: theme.text }}
                stroke={theme.grid}
              />
              <Tooltip
                {...tooltipStyle(theme)}
                formatter={(value: number) => [`${value}건`, "프로젝트"]}
              />
              <Bar
                dataKey="count"
                fill={theme.series}
                maxBarSize={20}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="기간별 평균 응답 시간"
          description="초 단위. 함수를 타는 질문이 많은 날은 길어진다"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid stroke={theme.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tickFormatter={label}
                tick={{ fontSize: 11, fill: theme.text }}
                stroke={theme.grid}
                /* 칸이 많으면 라벨이 겹친다. 열 칸 넘으면 하나씩 건너뛴다 */
                interval={tickSkip}
                minTickGap={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: theme.text }}
                stroke={theme.grid}
                tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}s`}
              />
              <Tooltip
                {...tooltipStyle(theme)}
                labelFormatter={(value) => label(String(value))}
                formatter={(value: number) => [
                  `${(value / 1000).toFixed(1)}초`,
                  "평균 응답",
                ]}
              />
              <Bar
                dataKey="avg_latency_ms"
                fill={theme.series}
                maxBarSize={24}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminChatbotStatsPage;
