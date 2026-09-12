// 역할: 관리자 — 챗봇 대화 기록 목록과 대화 전문 모달

import { useState } from "react";
import { MessageSquare, Wrench } from "lucide-react";
import FormModal from "@/component/admin/ui/feedback/formModal";
import Loading from "@/component/admin/ui/loading";
import PageSkeleton from "@/component/admin/ui/pageSkeleton";
import Pagination from "@/component/admin/ui/pagination";
import Table, { type Column } from "@/component/admin/ui/table/table";
import { useGet } from "@/hooks/common/useAPI";
import type {
  ChatbotLogDetail,
  ChatbotLogList,
  ChatbotLogSession,
} from "@/types/chatbot";

const PAGE_SIZE = 10;

/** "2026-09-07T18:32:11" → "09.07 18:32". 목록에서는 연도까지 볼 필요가 없다 */
const shortTime = (iso: string | null) => {
  if (!iso) return "-";
  const [date, time] = iso.split("T");
  return `${date.slice(5).replace("-", ".")} ${(time ?? "").slice(0, 5)}`;
};

const fullTime = (iso: string | null) =>
  iso ? `${iso.slice(0, 10).replace(/-/g, ".")} ${iso.slice(11, 19)}` : "-";

/**
 * User-Agent 전문은 표에서 읽을 수 없다. 브라우저와 기기만 뽑아 보여주고
 * 원문은 상세에서 확인한다.
 */
const shortAgent = (agent: string | null) => {
  if (!agent) return "-";
  const mobile = /Mobile|Android|iPhone|iPad/.test(agent) ? "모바일" : "PC";
  const browser = /Edg\//.test(agent)
    ? "Edge"
    : /OPR\//.test(agent)
      ? "Opera"
      : /Chrome\//.test(agent)
        ? "Chrome"
        : /Safari\//.test(agent)
          ? "Safari"
          : /Firefox\//.test(agent)
            ? "Firefox"
            : "기타";
  return `${browser} · ${mobile}`;
};

/**
 * 챗봇 대화 기록.
 *
 * 로그인이 없으므로 한 대화는 위젯이 만든 session_key 로 묶인다(새로고침은
 * 같은 세션, 탭을 닫으면 새 세션). 같은 사람의 재방문은 visitor_key 로 잇는다.
 */
const AdminChatbotLogPage = () => {
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);

  const { data, isLoading } = useGet<ChatbotLogList>(
    `api/chatbot/log?page=${page}&size=${PAGE_SIZE}`,
    ["chatbot-log", page],
  );

  /* 상세는 대화를 열 때만 불러온다. 목록에 답변 전문까지 얹으면 응답이 무거워진다 */
  const { data: detail } = useGet<ChatbotLogDetail>(
    `api/chatbot/log/detail?session_id=${openId ?? 0}`,
    ["chatbot-log-detail", openId ?? 0],
    openId !== null,
  );

  const sessions = data?.items ?? [];

  const columns: Column[] = [
    {
      key: "last_message_at",
      header: "마지막 대화",
      width: "120px",
      render: (row) => (
        <span className="tabular-nums">{shortTime(row.last_message_at)}</span>
      ),
    },
    {
      key: "first_question",
      header: "첫 질문",
      render: (row) => (
        <span className="line-clamp-2 text-text-main">
          {row.first_question || "-"}
        </span>
      ),
    },
    {
      key: "message_count",
      header: "질문",
      width: "60px",
      align: "right",
      render: (row) => <span className="tabular-nums">{row.message_count}</span>,
    },
    { key: "ip", header: "IP", width: "130px", render: (row) => row.ip || "-" },
    {
      key: "user_agent",
      header: "브라우저",
      width: "130px",
      render: (row) => shortAgent(row.user_agent),
    },
    {
      key: "visitor_key",
      header: "방문자",
      width: "90px",
      render: (row) => (
        /* 재방문을 눈으로 잇기 위한 앞 6자리. 전체는 상세에서 본다 */
        <span className="font-mono text-[11px] text-text-sub">
          {row.visitor_key ? row.visitor_key.slice(0, 6) : "-"}
        </span>
      ),
    },
  ];

  if (isLoading) return <PageSkeleton variant="table" />;

  return (
    <div className="relative flex min-h-full flex-col gap-4 pb-20">
      <div className="flex flex-wrap items-center gap-2">
        <span className="ml-auto shrink-0 whitespace-nowrap text-xs tabular-nums text-text-sub">
          대화 {data?.total ?? 0}건
        </span>
      </div>

      {/* 표 (md 이상) */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-bg-card md:block">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={sessions}
            size="md"
            rowCount={PAGE_SIZE}
            onRowClick={(row) => setOpenId((row as ChatbotLogSession).id)}
          />
        </div>
      </div>

      {/* 카드 (md 미만) */}
      <ul className="flex flex-col gap-3 md:hidden">
        {sessions.length === 0 && (
          <li className="rounded-xl border border-line bg-bg-card p-8 text-center text-sm text-text-sub">
            아직 대화가 없습니다.
          </li>
        )}
        {sessions.map((row) => (
          <li
            key={row.id}
            onClick={() => setOpenId(row.id)}
            className="cursor-pointer rounded-xl border border-line bg-bg-card p-4 transition-colors active:bg-bg-hover"
          >
            <p className="line-clamp-2 text-sm text-text-main">
              {row.first_question || "-"}
            </p>
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-sub">
              <span className="tabular-nums">{shortTime(row.last_message_at)}</span>
              <span>질문 {row.message_count}</span>
              <span>{row.ip || "-"}</span>
              <span>{shortAgent(row.user_agent)}</span>
            </p>
          </li>
        ))}
      </ul>

      <Pagination
        page={page}
        total={data?.total ?? 0}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />

      <FormModal
        open={openId !== null}
        onClose={() => setOpenId(null)}
        title="대화 전문"
        headerType="left"
        size="lg"
        footerType={1}
        primaryText="닫기"
        onPrimary={() => setOpenId(null)}
      >
        {detail ? (
          <div className="flex flex-col gap-4">
            {/* 누가 물었나 — 세 층의 식별자를 한자리에 */}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-line bg-bg-sub p-3 text-xs">
              <dt className="text-text-sub">시작</dt>
              <dd className="text-text-main">{fullTime(detail.session.started_at)}</dd>
              <dt className="text-text-sub">IP</dt>
              <dd className="text-text-main">{detail.session.ip || "-"}</dd>
              <dt className="text-text-sub">방문자</dt>
              <dd className="break-all font-mono text-text-main">
                {detail.session.visitor_key || "-"}
              </dd>
              <dt className="text-text-sub">유입</dt>
              <dd className="break-all text-text-main">
                {detail.session.referrer || "-"}
              </dd>
              <dt className="text-text-sub">User-Agent</dt>
              <dd className="break-all text-text-main">
                {detail.session.user_agent || "-"}
              </dd>
            </dl>

            {detail.messages.map((one) => (
              <div key={one.id} className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-text-sub" />
                  <p className="whitespace-pre-line text-sm font-medium text-text-main">
                    {one.question}
                  </p>
                </div>

                <p className="whitespace-pre-line rounded-lg border border-line bg-bg-sub px-3 py-2 text-sm text-text-main">
                  {one.answer || "(답변 없음)"}
                </p>

                {one.error && (
                  <p className="rounded-lg border border-point-red/40 px-3 py-2 text-xs text-point-red">
                    {one.error}
                  </p>
                )}

                {/* 어떤 검색이 걸렸는지 — 컨텍스트를 고칠 근거가 된다 */}
                <p className="flex flex-wrap items-center gap-2 text-[11px] text-text-sub">
                  <span className="tabular-nums">{fullTime(one.created_at)}</span>
                  {one.latency_ms !== null && (
                    <span className="tabular-nums">{(one.latency_ms / 1000).toFixed(1)}초</span>
                  )}
                  {/* 토큰은 매 질문 컨텍스트를 얼마나 먹었는지 보여준다.
                      입력이 계속 크면 컨텍스트를 줄일 근거가 된다 */}
                  {one.prompt_tokens !== null && (
                    <span className="tabular-nums">
                      입력 {one.prompt_tokens.toLocaleString()} · 출력{" "}
                      {(one.output_tokens ?? 0).toLocaleString()} 토큰
                    </span>
                  )}
                  {one.tools.length === 0 ? (
                    /* 함수를 안 썼다는 것도 정보다 — 칸이 비면 기록이 없는 줄 알게 된다 */
                    <span className="text-text-disabled">함수 미사용</span>
                  ) : (
                    one.tools.map((tool, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono"
                      >
                        <Wrench className="h-3 w-3" />
                        {tool.name}({Object.values(tool.args ?? {}).join(", ")})
                        {typeof tool.matched === "number" ? ` → ${tool.matched}건` : ""}
                      </span>
                    ))
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <Loading inline />
        )}
      </FormModal>
    </div>
  );
};

export default AdminChatbotLogPage;
