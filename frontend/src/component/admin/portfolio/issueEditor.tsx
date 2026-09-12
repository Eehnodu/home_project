// 역할: 프로젝트 편집 모달의 「문제와 해결」 입력. 항목마다 제목 · 문제 · 원인 · 해결 · 코드(선택)를 카드 하나로 편집한다

import { Plus, Trash2 } from "lucide-react";
import InputBox from "@/component/admin/ui/form/inputbox";
import TextareaBox from "@/component/admin/ui/form/textareaBox";
import type { ProjectIssue } from "@/types/portfolio";

interface IssueEditorProps {
  items: ProjectIssue[];
  onChange: (items: ProjectIssue[]) => void;
}

export const EMPTY_ISSUE: ProjectIssue = { title: "", problem: "", cause: "", solution: "", code: null };

/** 글자가 하나도 없는 카드는 저장할 때 뺀다. 코드는 본문이 있을 때만 남긴다 */
export const cleanIssues = (items: ProjectIssue[]): ProjectIssue[] =>
  items
    .map((one) => ({
      title: one.title.trim(),
      problem: one.problem.trim(),
      cause: one.cause.trim(),
      solution: one.solution.trim(),
      code: one.code?.snippet.trim()
        ? { lang: one.code.lang.trim(), snippet: one.code.snippet.replace(/\s+$/, "") }
        : null,
    }))
    .filter((one) => one.title || one.problem || one.cause || one.solution);

const IssueEditor = ({ items, onChange }: IssueEditorProps) => {
  const patch = (index: number, next: Partial<ProjectIssue>) =>
    onChange(items.map((one, at) => (at === index ? { ...one, ...next } : one)));

  const handleAdd = () => onChange([...items, { ...EMPTY_ISSUE }]);
  const handleRemove = (index: number) => onChange(items.filter((_, at) => at !== index));

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-lg border border-line p-3">
          <div className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-text-sub">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <InputBox value={item.title} onChange={(value) => patch(index, { title: value })} placeholder="제목" full />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="shrink-0 rounded-md p-2 text-text-sub hover:bg-bg-hover hover:text-text-main"
              aria-label="항목 삭제"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
            <TextareaBox value={item.problem} onChange={(value) => patch(index, { problem: value })} placeholder="문제" rows={4} />
            <TextareaBox value={item.cause} onChange={(value) => patch(index, { cause: value })} placeholder="원인" rows={4} />
            <TextareaBox value={item.solution} onChange={(value) => patch(index, { solution: value })} placeholder="해결" rows={4} />
          </div>
          {/* 코드는 글로 풀면 길어지는 곳에만. 언어는 표시용 라벨 */}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[140px_1fr]">
            <InputBox
              value={item.code?.lang ?? ""}
              onChange={(value) => patch(index, { code: { lang: value, snippet: item.code?.snippet ?? "" } })}
              placeholder="코드 언어 (선택)"
              full
            />
            <TextareaBox
              value={item.code?.snippet ?? ""}
              onChange={(value) => patch(index, { code: { lang: item.code?.lang ?? "", snippet: value } })}
              placeholder="코드 (선택)"
              className="font-mono"
              rows={3}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2.5 text-sm text-text-sub hover:bg-bg-hover hover:text-text-main"
      >
        <Plus className="h-4 w-4" />
        항목 추가
      </button>
    </div>
  );
};

export default IssueEditor;
