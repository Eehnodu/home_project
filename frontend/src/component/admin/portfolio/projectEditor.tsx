// 역할: 프로젝트 한 건 편집 모달. 이미지는 즉시 업로드하고 저장 시 폼 전체를 부모에 넘긴다

import { useEffect, useState } from "react";
import FormModal from "@/component/admin/ui/feedback/formModal";
import InputBox from "@/component/admin/ui/form/inputbox";
import SelectBox from "@/component/admin/ui/form/selectBox";
import TextareaBox from "@/component/admin/ui/form/textareaBox";
import Toggle from "@/component/admin/ui/form/toggle";
import ChipInput from "@/component/admin/portfolio/chipInput";
import type { PortfolioProject, ProjectPoint } from "@/types/portfolio";

interface ProjectEditorProps {
  open: boolean;
  /** null 이면 새 프로젝트 */
  project: PortfolioProject | null;
  saving: boolean;
  onClose: () => void;
  onSave: (project: PortfolioProject) => void;
  onError: (message: string) => void;
}

export const EMPTY_PROJECT: PortfolioProject = {
  name: "",
  kind: "SI",
  category: "",
  status: "완료",
  start_date: null,
  end_date: null,
  role: "풀스택",
  team: "",
  summary: "",
  description: "",
  url: null,
  tech_stack: [],
  tags: [],
  integrations: [],
  highlights: [],
  features: [],
  improvements: [],
  visible: true,
};

/* 선택지는 화면과 백엔드가 같은 문자열을 쓰면 되므로 여기 한 곳에만 둔다.
   목록 화면의 필터도 이 목록을 그대로 쓴다. */
export const PROJECT_KINDS = ["개인", "자사", "SI"];
export const PROJECT_STATUSES = ["완료", "진행 중", "운영 중", "개발 중", "지속 갱신", "QA"];
export const PROJECT_CATEGORIES = ["사이드 프로젝트", "자사 서비스", "AI 서비스", "챗봇", "ERP"];

const toOptions = (values: string[]) =>
  values.map((one) => ({ label: one, value: one }));

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/* 핵심 · 기능 · 문제와 개선은 "제목 | 설명" 한 줄에 한 항목으로 편집한다.
   구분자가 없는 줄은 설명만 있는 항목. 폼을 열 때 텍스트로 풀고 저장할 때 다시 묶는다 */
const POINT_SEPARATOR = " | ";

const pointsToText = (points: ProjectPoint[]) =>
  points
    .map((one) => (one.title ? `${one.title}${POINT_SEPARATOR}${one.body}` : one.body))
    .join("\n");

const textToPoints = (text: string): ProjectPoint[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf("|");
      if (at < 0) return { title: "", body: line };
      return { title: line.slice(0, at).trim(), body: line.slice(at + 1).trim() };
    });

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-semibold text-text-main">{label}</span>
      {hint && <span className="text-xs text-text-sub">{hint}</span>}
    </div>
    {children}
  </div>
);

/**
 * 프로젝트 한 건을 편집하는 모달.
 * 값은 폼 상태에 담아 두고 DB 반영은 저장 버튼에서 한다.
 */
const ProjectEditor = ({
  open,
  project,
  saving,
  onClose,
  onSave,
  onError,
}: ProjectEditorProps) => {
  const [form, setForm] = useState<PortfolioProject>(EMPTY_PROJECT);
  /* 세 절은 줄 단위 텍스트로 편집한다. 배열 ↔ 텍스트 변환은 열고 저장할 때만 */
  const [highlightText, setHighlightText] = useState("");
  const [featureText, setFeatureText] = useState("");
  const [improvementText, setImprovementText] = useState("");

  useEffect(() => {
    if (!open) return;
    const next = project ? { ...EMPTY_PROJECT, ...project } : EMPTY_PROJECT;
    setForm(next);
    setHighlightText(pointsToText(next.highlights));
    setFeatureText(pointsToText(next.features));
    setImprovementText(pointsToText(next.improvements));
  }, [open, project]);

  const update = <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));


  const handleSave = () => {
    if (!form.name.trim()) {
      onError("프로젝트 이름을 입력해주세요.");
      return;
    }
    const start = form.start_date?.trim() || null;
    const end = form.end_date?.trim() || null;
    if ((start && !DATE_PATTERN.test(start)) || (end && !DATE_PATTERN.test(end))) {
      onError("날짜는 YYYY-MM-DD 형식으로 입력해주세요.");
      return;
    }
    if (start && end && end < start) {
      onError("종료일이 시작일보다 앞설 수 없습니다.");
      return;
    }
    onSave({
      ...form,
      start_date: start,
      end_date: end,
      url: form.url?.trim() || null,
      highlights: textToPoints(highlightText),
      features: textToPoints(featureText),
      improvements: textToPoints(improvementText),
    });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      headerType="left"
      title={project ? "프로젝트 수정" : "프로젝트 추가"}
      description={project?.name}
      size="lg"
      className="!max-w-4xl"
      footerType={2}
      primaryText={saving ? "저장 중..." : "저장"}
      primaryDisabled={saving}
      onPrimary={handleSave}
      secondaryText="취소"
      onSecondary={onClose}
    >
      <div className="flex flex-col gap-5 py-1">
        {/* 공개 여부 — 꺼두면 공개 화면에서 빠지고 관리자 표에만 남는다 */}
        <label className="flex w-fit cursor-pointer items-center gap-3">
          <Toggle
            checked={form.visible}
            onChange={(checked) => update("visible", checked)}
            size="sm"
          />
          <span className="text-sm font-semibold text-text-main">
            {form.visible ? "공개" : "비공개"}
          </span>
          <span className="text-xs text-text-sub">
            {form.visible ? "포트폴리오에 보입니다" : "관리자 화면에만 남습니다"}
          </span>
        </label>

        {/* 기본 정보 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="이름">
            <InputBox
              value={form.name}
              onChange={(value) => update("name", value)}
              placeholder="제로바타 (Zerovatar)"
              full
            />
          </Field>
          <Field label="구분">
            <SelectBox
              value={form.kind}
              onChange={(value) => update("kind", String(value))}
              options={toOptions(PROJECT_KINDS)}
            />
          </Field>
          <Field label="카테고리">
            <SelectBox
              value={form.category}
              onChange={(value) => update("category", String(value))}
              options={toOptions(PROJECT_CATEGORIES)}
              placeholder="선택"
            />
          </Field>
          <Field label="상태">
            <SelectBox
              value={form.status}
              onChange={(value) => update("status", String(value))}
              options={toOptions(PROJECT_STATUSES)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="시작일" hint="YYYY-MM-DD">
            <InputBox
              value={form.start_date ?? ""}
              onChange={(value) => update("start_date", value)}
              placeholder="2026-03-17"
              full
            />
          </Field>
          <Field label="종료일" hint="진행 중이면 비움">
            <InputBox
              value={form.end_date ?? ""}
              onChange={(value) => update("end_date", value)}
              placeholder="2026-04-30"
              full
            />
          </Field>
          <Field label="역할">
            <InputBox
              value={form.role}
              onChange={(value) => update("role", value)}
              placeholder="풀스택"
              full
            />
          </Field>
          <Field label="팀 구성" hint="선택">
            <InputBox
              value={form.team}
              onChange={(value) => update("team", value)}
              placeholder="개발 2명 · 기획 1명"
              full
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
          <Field label="URL" hint="선택">
            <InputBox
              value={form.url ?? ""}
              onChange={(value) => update("url", value)}
              placeholder="https://"
              type="url"
              full
            />
          </Field>
          <Field label="한 줄 소개" hint="카드에 보인다">
            <InputBox
              value={form.summary}
              onChange={(value) => update("summary", value)}
              placeholder="QR 기반 전시 키오스크 멀티테넌트 플랫폼"
              full
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="상세 설명" hint="줄바꿈 하나가 문단 하나">
            <TextareaBox
              value={form.description}
              onChange={(value) => update("description", value)}
              rows={7}
            />
          </Field>
          <Field label="핵심" hint="한 줄에 하나 · 제목 | 설명">
            <TextareaBox
              value={highlightText}
              onChange={setHighlightText}
              rows={7}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="기능" hint="한 줄에 하나 · 제목 | 설명">
            <TextareaBox
              value={featureText}
              onChange={setFeatureText}
              rows={7}
            />
          </Field>
          <Field label="문제와 개선" hint="한 줄에 하나 · 제목 | 설명 · 사이드 프로젝트는 비워 둔다">
            <TextareaBox
              value={improvementText}
              onChange={setImprovementText}
              rows={7}
            />
          </Field>
        </div>

        {/* 칩이 길게 늘어나는 필드라 열로 나누지 않고 한 줄씩 가로 전체를 쓴다 */}
        <div className="flex flex-col gap-4">
          <Field label="기술 스택" hint="Enter 로 추가">
            <ChipInput
              value={form.tech_stack}
              onChange={(value) => update("tech_stack", value)}
              placeholder="FastAPI"
            />
          </Field>
          <Field label="외부 연동" hint="Enter 로 추가">
            <ChipInput
              value={form.integrations}
              onChange={(value) => update("integrations", value)}
              placeholder="OpenAI"
            />
          </Field>
          <Field label="태그" hint="Enter 로 추가">
            <ChipInput
              value={form.tags}
              onChange={(value) => update("tags", value)}
              placeholder="챗봇"
            />
          </Field>
        </div>

      </div>
    </FormModal>
  );
};

export default ProjectEditor;
