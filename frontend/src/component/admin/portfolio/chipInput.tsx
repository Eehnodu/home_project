// 역할: 문자열 목록을 칩으로 편집하는 입력 (Enter · 쉼표 추가, Backspace 삭제)

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface ChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

/**
 * 짧은 문자열 목록(기술 스택 · 태그 · 외부 연동)을 칩으로 편집한다.
 * Enter 나 쉼표로 추가하고, 마지막 칩은 빈 입력에서 Backspace 로 지운다.
 * 붙여넣기한 "A, B, C" 도 쉼표 기준으로 한 번에 나눈다.
 */
const ChipInput = ({
  value,
  onChange,
  placeholder = "입력 후 Enter",
}: ChipInputProps) => {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const added = raw
      .split(",")
      .map((one) => one.trim())
      .filter((one) => one && !value.includes(one));
    if (added.length > 0) onChange([...value, ...added]);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
      return;
    }
    if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-input px-2 py-1.5 focus-within:border-line-focus">
      {value.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-bg-sub px-2 py-0.5 text-xs text-text-main"
        >
          {chip}
          <button
            type="button"
            onClick={() => onChange(value.filter((one) => one !== chip))}
            className="text-text-sub hover:text-text-main"
            aria-label={`${chip} 삭제`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft.trim() && commit(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[8rem] flex-1 bg-transparent px-1 text-sm text-text-main outline-none placeholder:text-text-placeholder"
      />
    </div>
  );
};

export default ChipInput;
