// 역할: 관리자 — Approach 카드 편집. 순서 포함 목록을 통째로 저장한다

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from "lucide-react";
import Button from "@/component/admin/ui/form/button";
import InputBox from "@/component/admin/ui/form/inputbox";
import TextareaBox from "@/component/admin/ui/form/textareaBox";
import SelectBox from "@/component/admin/ui/form/selectBox";
import Toast from "@/component/admin/ui/feedback/toast";
import PageSkeleton from "@/component/admin/ui/pageSkeleton";
import {
  APPROACH_ICON_KEYS,
  resolveApproachIcon,
} from "@/component/client/portfolio/approachIcons";
import { useGet, usePost } from "@/hooks/common/useAPI";
import type { ApproachCard } from "@/types/portfolio";

const EMPTY_CARD: ApproachCard = { icon: "code", title: "", description: "" };

/** 공개 화면이 2열 3행이라 6개에서 정확히 맞는다. 백엔드도 같은 값으로 막는다 */
const MAX_CARDS = 6;

const ICON_OPTIONS = APPROACH_ICON_KEYS.map((key) => ({
  label: key,
  value: key,
}));

const AdminPortfolioApproachPage = () => {
  const { data, isLoading } = useGet<ApproachCard[]>("api/portfolio/approach", [
    "portfolio-approach",
  ]);

  const [cards, setCards] = useState<ApproachCard[]>([]);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    title: string;
  } | null>(null);

  const save = usePost<{ approaches: ApproachCard[] }, ApproachCard[]>(
    "api/portfolio/approach",
  );

  useEffect(() => {
    if (data) setCards(data);
  }, [data]);

  const updateCard = (index: number, patch: Partial<ApproachCard>) =>
    setCards((prev) =>
      prev.map((one, i) => (i === index ? { ...one, ...patch } : one)),
    );

  /** 배열 순서가 그대로 sort_order 로 저장된다 */
  const moveCard = (index: number, direction: -1 | 1) =>
    setCards((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handleSave = () =>
    save.mutate(
      { approaches: cards },
      {
        onSuccess: (result) => {
          setCards(result);
          setToast({ type: "success", title: "저장했습니다." });
        },
        onError: (error) =>
          setToast({ type: "error", title: error?.message ?? "저장 실패" }),
      },
    );

  if (isLoading) return <PageSkeleton variant="form" />;

  const isFull = cards.length >= MAX_CARDS;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-center justify-end gap-3">
        <span className="text-xs tabular-nums text-text-sub">
          {cards.length} / {MAX_CARDS}
        </span>
        <Button
          variant="sub2"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setCards((prev) => [...prev, { ...EMPTY_CARD }])}
          disabled={isFull}
        >
          {isFull ? `최대 ${MAX_CARDS}개` : "카드 추가"}
        </Button>
        <Button
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSave}
          disabled={save.isPending}
        >
          {save.isPending ? "저장 중..." : "저장"}
        </Button>
      </div>

      {cards.length === 0 && (
        <p className="rounded-xl border border-line bg-bg-card p-8 text-center text-sm text-text-sub">
          등록된 카드가 없습니다. 카드를 추가해주세요.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {cards.map((card, index) => {
          const Icon = resolveApproachIcon(card.icon);
          return (
            <section
              key={card.id ?? `new-${index}`}
              className="flex flex-col gap-4 rounded-xl border border-line bg-bg-card p-5"
            >
              <div className="flex items-center gap-3">
                {/* 선택한 아이콘 미리보기 */}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-bg-sub text-text-main">
                  <Icon className="h-[18px] w-[18px]" />
                </span>

                <span className="text-xs font-semibold tabular-nums text-text-sub">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveCard(index, -1)}
                    disabled={index === 0}
                    aria-label="위로"
                    className="rounded-lg p-2 text-text-sub hover:bg-bg-hover hover:text-text-main disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCard(index, 1)}
                    disabled={index === cards.length - 1}
                    aria-label="아래로"
                    className="rounded-lg p-2 text-text-sub hover:bg-bg-hover hover:text-text-main disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCards((prev) => prev.filter((_, i) => i !== index))
                    }
                    aria-label="카드 삭제"
                    className="rounded-lg p-2 text-text-sub hover:bg-bg-hover hover:text-point-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr]">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-text-main">
                    아이콘
                  </span>
                  <SelectBox
                    value={card.icon}
                    onChange={(value) => updateCard(index, { icon: String(value) })}
                    options={ICON_OPTIONS}
                    placeholder="아이콘 선택"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-sm font-semibold text-text-main">
                    제목
                  </span>
                  <InputBox
                    value={card.title}
                    onChange={(value) => updateCard(index, { title: value })}
                    placeholder="이해하기 쉬운 코드"
                    full
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-text-main">
                  설명
                </span>
                <TextareaBox
                  value={card.description}
                  onChange={(value) =>
                    updateCard(index, { description: value })
                  }
                  rows={3}
                />
              </div>
            </section>
          );
        })}
      </div>

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

export default AdminPortfolioApproachPage;
