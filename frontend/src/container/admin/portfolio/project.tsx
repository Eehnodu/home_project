// 역할: 관리자 — 프로젝트 목록(검색 · 필터 · 페이지)과 건별 추가 · 수정 · 삭제 · 공개 토글

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import Button from "@/component/admin/ui/form/button";
import InputBox from "@/component/admin/ui/form/inputbox";
import SelectBox from "@/component/admin/ui/form/selectBox";
import Toggle from "@/component/admin/ui/form/toggle";
import Modal from "@/component/admin/ui/feedback/modal";
import Toast from "@/component/admin/ui/feedback/toast";
import PageSkeleton from "@/component/admin/ui/pageSkeleton";
import Pagination from "@/component/admin/ui/pagination";
import Table, { type Column } from "@/component/admin/ui/table/table";
import ProjectEditor, {
  PROJECT_CATEGORIES,
  PROJECT_KINDS,
  PROJECT_STATUSES,
} from "@/component/admin/portfolio/projectEditor";
import { useGet, usePost } from "@/hooks/common/useAPI";
import type { PortfolioProject } from "@/types/portfolio";

/* 관리자는 꺼둔 프로젝트까지 봐야 하므로 공개 목록과 다른 API · 다른 키를 쓴다 */
const QUERY_KEY = ["portfolio-project-admin"];
const PUBLIC_QUERY_KEY = ["portfolio-project"];
const PAGE_SIZE = 10;
const ALL = "";

type ToastState = { type: "success" | "error"; title: string } | null;

const withAll = (values: string[]) => [
  { label: "전체", value: ALL },
  ...values.map((one) => ({ label: one, value: one })),
];

/** 상태마다 색을 달리해 표에서 한눈에 구분되게 한다 */
const STATUS_CLASS: Record<string, string> = {
  완료: "border-line bg-bg-sub text-text-main",
  "진행 중": "border-primary/40 bg-primary-light text-primary",
  QA: "border-line bg-bg-card text-text-main",
  폐기: "border-line bg-bg-card text-text-disabled",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${
      STATUS_CLASS[status] ?? "border-line text-text-sub"
    }`}
  >
    {status || "-"}
  </span>
);

/** "2026-03-17" → "2026.03.17". 비어 있으면 대시 */
const dot = (iso: string | null) => (iso ? iso.slice(0, 10).replace(/-/g, ".") : "-");

/**
 * 프로젝트는 건수가 많아 다른 섹션처럼 한 화면에서 통째로 편집하지 않는다.
 * 검색·필터가 붙은 표에서 한 건을 골라 모달로 고친다. 순서는 시작일 내림차순 고정.
 */
const AdminPortfolioProjectPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGet<PortfolioProject[]>(
    "api/portfolio/project/all",
    QUERY_KEY,
  );

  const [keyword, setKeyword] = useState("");
  const [kind, setKind] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleting, setDeleting] = useState<PortfolioProject | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const save = usePost<PortfolioProject, PortfolioProject>(
    "api/portfolio/project",
  );
  const remove = usePost<{ id: number }, { id: number }>(
    "api/portfolio/project/delete",
  );

  const projects = data ?? [];

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    return projects.filter(
      (one) =>
        (!needle ||
          one.name.toLowerCase().includes(needle) ||
          one.summary.toLowerCase().includes(needle) ||
          one.tech_stack.some((tech) => tech.toLowerCase().includes(needle))) &&
        (kind === ALL || one.kind === kind) &&
        (category === ALL || one.category === category) &&
        (status === ALL || one.status === status),
    );
  }, [projects, keyword, kind, category, status]);

  /* 조건이 바뀌면 1페이지로. 안 그러면 결과가 줄었을 때 빈 페이지에 머문다 */
  useEffect(() => {
    setPage(1);
  }, [keyword, kind, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const isFiltered = !!keyword || kind !== ALL || category !== ALL || status !== ALL;

  const resetFilters = () => {
    setKeyword("");
    setKind(ALL);
    setCategory(ALL);
    setStatus(ALL);
  };

  const refresh = () => {
    /* 관리자 목록과 공개 목록은 키가 달라 둘 다 무효화한다. 안 그러면 같은 탭에서
       공개 화면을 열었을 때 staleTime(5분) 동안 이전 목록이 보인다 */
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: PUBLIC_QUERY_KEY });
  };

  const openEditor = (project: PortfolioProject | null) => {
    setEditing(project);
    setEditorOpen(true);
  };

  /** 표의 토글은 모달을 거치지 않고 바로 저장한다 */
  const handleToggleVisible = (project: PortfolioProject, visible: boolean) =>
    save.mutate(
      { ...project, visible },
      {
        onSuccess: () => {
          refresh();
          setToast({
            type: "success",
            title: visible ? "공개로 바꿨습니다." : "비공개로 바꿨습니다.",
          });
        },
        onError: (error) =>
          setToast({ type: "error", title: error?.message ?? "저장 실패" }),
      },
    );

  const handleSave = (project: PortfolioProject) =>
    save.mutate(project, {
      onSuccess: () => {
        setEditorOpen(false);
        refresh();
        setToast({ type: "success", title: "저장했습니다." });
      },
      onError: (error) =>
        setToast({ type: "error", title: error?.message ?? "저장 실패" }),
    });

  const handleDelete = () => {
    if (!deleting?.id) return;
    remove.mutate(
      { id: deleting.id },
      {
        onSuccess: () => {
          setDeleting(null);
          refresh();
          setToast({ type: "success", title: "삭제했습니다." });
        },
        onError: (error) =>
          setToast({ type: "error", title: error?.message ?? "삭제 실패" }),
      },
    );
  };

  const columns: Column[] = [
    {
      key: "no",
      header: "No",
      width: "56px",
      align: "center",
      render: (row: PortfolioProject) => (
        <span className="tabular-nums text-text-sub">
          {pageStart + pageRows.indexOf(row) + 1}
        </span>
      ),
    },
    {
      key: "name",
      header: "프로젝트",
      render: (row: PortfolioProject) => (
        /* 꺼둔 프로젝트는 흐리게 — 표에서 바로 구분되게 */
        <div className={`flex min-w-0 flex-col ${row.visible ? "" : "opacity-50"}`}>
          <span className="truncate font-medium text-text-main">{row.name}</span>
          {row.summary && (
            <span className="truncate text-xs text-text-sub">{row.summary}</span>
          )}
        </div>
      ),
    },
    {
      key: "kind",
      header: "구분",
      width: "72px",
      align: "center",
      render: (row: PortfolioProject) => row.kind || "-",
    },
    {
      key: "category",
      header: "카테고리",
      width: "104px",
      align: "center",
      render: (row: PortfolioProject) => row.category || "-",
    },
    {
      key: "status",
      header: "상태",
      width: "88px",
      align: "center",
      render: (row: PortfolioProject) => <StatusBadge status={row.status} />,
    },
    {
      key: "start_date",
      header: "시작일",
      width: "104px",
      align: "center",
      render: (row: PortfolioProject) => (
        <span className="tabular-nums">{dot(row.start_date)}</span>
      ),
    },
    {
      key: "end_date",
      header: "종료일",
      width: "104px",
      align: "center",
      render: (row: PortfolioProject) => (
        <span className={`tabular-nums ${row.end_date ? "" : "text-text-sub"}`}>
          {row.end_date ? dot(row.end_date) : "진행 중"}
        </span>
      ),
    },
    {
      key: "tech_stack",
      header: "기술",
      width: "64px",
      align: "center",
      render: (row: PortfolioProject) => (
        <span className="tabular-nums text-text-sub">{row.tech_stack.length}</span>
      ),
    },
    {
      key: "visible",
      header: "공개",
      width: "72px",
      align: "center",
      render: (row: PortfolioProject) => (
        /* 행 클릭(수정 열기)으로 새지 않게 막는다 */
        <div
          className="flex items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <Toggle
            checked={row.visible}
            onChange={(checked) => handleToggleVisible(row, checked)}
            size="sm"
            disabled={save.isPending}
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "관리",
      width: "88px",
      align: "center",
      render: (row: PortfolioProject) => (
        /* 행 클릭(수정 열기)으로 새지 않게 막는다 */
        <div
          className="flex items-center justify-center gap-0.5"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => openEditor(row)}
            aria-label="수정"
            className="rounded-lg p-1.5 text-text-sub hover:bg-bg-hover hover:text-text-main"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(row)}
            aria-label="삭제"
            className="rounded-lg p-1.5 text-text-sub hover:bg-bg-hover hover:text-point-red"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) return <PageSkeleton variant="table" />;

  return (
    /* relative + h-full: 페이지네이션이 이 영역 하단에 absolute 로 붙는다.
       pb-20 은 페이지네이션 자리 — 표가 그 밑으로 깔리지 않게 */
    <div className="relative flex min-h-full flex-col gap-4 pb-20">
      {/* 도구 줄 — 데스크탑은 검색 · 필터 · 건수 · 추가를 한 줄에, 모바일은 줄바꿈.
          overflow 를 걸면 SelectBox 의 absolute 드롭다운이 잘리므로 걸지 않는다 */}
      <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
        <div className="w-full shrink-0 md:w-56">
          <InputBox
            value={keyword}
            onChange={setKeyword}
            placeholder="이름 · 소개 · 기술 검색"
            type="search"
            leftIcon={<Search className="h-4 w-4" />}
            full
          />
        </div>
        {/* SelectBox 루트가 w-full 이라 className 의 폭이 밀린다 — 고정폭 div 로 감싼다 */}
        <div className="w-24 shrink-0">
          <SelectBox
            value={kind}
            onChange={(value) => setKind(String(value))}
            options={withAll(PROJECT_KINDS)}
            placeholder="구분"
          />
        </div>
        <div className="w-32 shrink-0">
          <SelectBox
            value={category}
            onChange={(value) => setCategory(String(value))}
            options={withAll(PROJECT_CATEGORIES)}
            placeholder="카테고리"
          />
        </div>
        <div className="w-24 shrink-0">
          <SelectBox
            value={status}
            onChange={(value) => setStatus(String(value))}
            options={withAll(PROJECT_STATUSES)}
            placeholder="상태"
          />
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs text-text-sub hover:bg-bg-hover hover:text-text-main"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </button>
        )}

        <span className="ml-auto shrink-0 whitespace-nowrap text-xs tabular-nums text-text-sub">
          {isFiltered ? `${filtered.length} / ${projects.length}건` : `${projects.length}건`}
        </span>
        <Button
          className="shrink-0 whitespace-nowrap"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => openEditor(null)}
        >
          프로젝트 추가
        </Button>
      </div>

      {/* 표 (md 이상). 10행으로 높이를 고정해 페이지가 바뀌어도 크기가 튀지 않는다 */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-bg-card md:block">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={pageRows}
            size="md"
            rowCount={PAGE_SIZE}
            onRowClick={(row) => openEditor(row as PortfolioProject)}
          />
        </div>
      </div>

      {/* 카드 (md 미만). 컬럼 10개짜리 표는 좁은 화면에서 읽을 수 없어 한 건을 카드 하나로 */}
      <ul className="flex flex-col gap-3 md:hidden">
        {pageRows.length === 0 && (
          <li className="rounded-xl border border-line bg-bg-card p-8 text-center text-sm text-text-sub">
            데이터가 없습니다.
          </li>
        )}
        {pageRows.map((row, index) => (
          <li
            key={row.id ?? index}
            onClick={() => openEditor(row)}
            className={`cursor-pointer rounded-xl border border-line bg-bg-card p-4 transition-colors active:bg-bg-hover ${
              row.visible ? "" : "opacity-60"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="pt-0.5 text-xs tabular-nums text-text-sub">
                {pageStart + index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-text-main">{row.name}</span>
                  <StatusBadge status={row.status} />
                </div>
                {row.summary && (
                  <p className="mt-0.5 truncate text-xs text-text-sub">{row.summary}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-sub">
                  <span>{[row.kind, row.category].filter(Boolean).join(" · ") || "-"}</span>
                  <span className="tabular-nums">
                    {dot(row.start_date)} - {row.end_date ? dot(row.end_date) : "진행 중"}
                  </span>
                  <span className="tabular-nums">기술 {row.tech_stack.length}</span>
                </div>
              </div>

              {/* 토글·수정·삭제 — 카드 클릭(수정 열기)으로 새지 않게 막는다 */}
              <div
                className="flex shrink-0 flex-col items-end gap-2"
                onClick={(event) => event.stopPropagation()}
              >
                <Toggle
                  checked={row.visible}
                  onChange={(checked) => handleToggleVisible(row, checked)}
                  size="sm"
                  disabled={save.isPending}
                />
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => openEditor(row)}
                    aria-label="수정"
                    className="rounded-lg p-1.5 text-text-sub hover:bg-bg-hover hover:text-text-main"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(row)}
                    aria-label="삭제"
                    className="rounded-lg p-1.5 text-text-sub hover:bg-bg-hover hover:text-point-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 — 표 밖, 화면 하단 중앙에 absolute 로 고정 (overlay variant) */}
      <Pagination
        page={currentPage}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />

      <ProjectEditor
        open={editorOpen}
        project={editing}
        saving={save.isPending}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        onError={(message) => setToast({ type: "error", title: message })}
      />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="프로젝트 삭제"
        description={`"${deleting?.name}" 을(를) 삭제합니다. 올린 이미지도 함께 지워지며 되돌릴 수 없습니다.`}
        size="sm"
        buttonCount={2}
        primaryText={remove.isPending ? "삭제 중..." : "삭제"}
        primaryVariant="danger"
        primaryDisabled={remove.isPending}
        onPrimary={handleDelete}
        secondaryText="취소"
        onSecondary={() => setDeleting(null)}
      />

      <Toast
        open={!!toast}
        onClose={() => setToast(null)}
        type={toast?.type}
        title={toast?.title}
        duration={2500}
      />
    </div>
  );
};

export default AdminPortfolioProjectPage;
