// 역할: 관리자 — Tech Stack 카테고리 · 기술 편집. 아이콘은 즉시 업로드하고 목록은 통째로 저장

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from "lucide-react";
import Button from "@/component/admin/ui/form/button";
import InputBox from "@/component/admin/ui/form/inputbox";
import Toast from "@/component/admin/ui/feedback/toast";
import PageSkeleton from "@/component/admin/ui/pageSkeleton";
import ImagePicker from "@/component/admin/portfolio/imagePicker";
import { useGet, usePost } from "@/hooks/common/useAPI";
import { mediaUrl } from "@/utils/media";
import type { StackCategory, StackItem } from "@/types/portfolio";

const EMPTY_ITEM: StackItem = { name: "", icon_image: null };

/** 업로드 중인 칸을 "카테고리-아이템" 좌표로 기억한다 */
type UploadTarget = { category: number; item: number } | null;

const AdminPortfolioStackPage = () => {
  const { data, isLoading } = useGet<StackCategory[]>("api/portfolio/stack", [
    "portfolio-stack",
  ]);

  const [categories, setCategories] = useState<StackCategory[]>([]);
  const [uploading, setUploading] = useState<UploadTarget>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    title: string;
  } | null>(null);

  const save = usePost<{ categories: StackCategory[] }, StackCategory[]>(
    "api/portfolio/stack",
  );
  const uploadImage = usePost<FormData, { path: string }>(
    "api/portfolio/info/image",
  );

  useEffect(() => {
    if (data) setCategories(data);
  }, [data]);

  const updateCategory = (index: number, patch: Partial<StackCategory>) =>
    setCategories((prev) =>
      prev.map((one, i) => (i === index ? { ...one, ...patch } : one)),
    );

  const updateItem = (
    categoryIndex: number,
    itemIndex: number,
    patch: Partial<StackItem>,
  ) =>
    setCategories((prev) =>
      prev.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              items: category.items.map((item, j) =>
                j === itemIndex ? { ...item, ...patch } : item,
              ),
            }
          : category,
      ),
    );

  /** 배열 순서가 그대로 sort_order 로 저장된다 */
  const moveCategory = (index: number, direction: -1 | 1) =>
    setCategories((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handleUploadIcon = (
    categoryIndex: number,
    itemIndex: number,
    file: File,
  ) => {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", "stack");

    setUploading({ category: categoryIndex, item: itemIndex });
    uploadImage.mutate(body, {
      onSuccess: (result) => {
        updateItem(categoryIndex, itemIndex, { icon_image: result.path });
        setToast({ type: "success", title: "올렸습니다. 저장을 눌러주세요." });
      },
      onError: (error) =>
        setToast({ type: "error", title: error?.message ?? "업로드 실패" }),
      onSettled: () => setUploading(null),
    });
  };

  const handleSave = () =>
    save.mutate(
      { categories },
      {
        onSuccess: (result) => {
          setCategories(result);
          setToast({ type: "success", title: "저장했습니다." });
        },
        onError: (error) =>
          setToast({ type: "error", title: error?.message ?? "저장 실패" }),
      },
    );

  if (isLoading) return <PageSkeleton variant="form" />;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="sub2"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() =>
            setCategories((prev) => [...prev, { name: "", items: [] }])
          }
        >
          카테고리 추가
        </Button>
        <Button
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSave}
          disabled={save.isPending}
        >
          {save.isPending ? "저장 중..." : "저장"}
        </Button>
      </div>

      {categories.length === 0 && (
        <p className="rounded-xl border border-line bg-bg-card p-8 text-center text-sm text-text-sub">
          등록된 카테고리가 없습니다. 카테고리를 추가해주세요.
        </p>
      )}

      {categories.map((category, categoryIndex) => (
        <section
          key={category.id ?? `new-${categoryIndex}`}
          className="flex flex-col gap-4 rounded-xl border border-line bg-bg-card p-5"
        >
          <div className="flex items-center gap-2">
            <InputBox
              value={category.name}
              onChange={(value) => updateCategory(categoryIndex, { name: value })}
              placeholder="카테고리 이름 (예: Frontend)"
              className="max-w-xs"
            />

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveCategory(categoryIndex, -1)}
                disabled={categoryIndex === 0}
                aria-label="위로"
                className="rounded-lg p-2 text-text-sub hover:bg-bg-hover hover:text-text-main disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveCategory(categoryIndex, 1)}
                disabled={categoryIndex === categories.length - 1}
                aria-label="아래로"
                className="rounded-lg p-2 text-text-sub hover:bg-bg-hover hover:text-text-main disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCategories((prev) =>
                    prev.filter((_, i) => i !== categoryIndex),
                  )
                }
                aria-label="카테고리 삭제"
                className="rounded-lg p-2 text-text-sub hover:bg-bg-hover hover:text-point-red"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            {category.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="flex w-28 flex-col items-center gap-2 rounded-lg border border-line p-3"
              >
                <ImagePicker
                  previewUrl={mediaUrl(item.icon_image)}
                  onSelectFile={(file) =>
                    handleUploadIcon(categoryIndex, itemIndex, file)
                  }
                  onRemove={() =>
                    updateItem(categoryIndex, itemIndex, { icon_image: null })
                  }
                  uploading={
                    uploading?.category === categoryIndex &&
                    uploading?.item === itemIndex
                  }
                  sizeClassName="w-14"
                  placeholder="아이콘"
                  fit="contain"
                />

                <InputBox
                  value={item.name}
                  onChange={(value) =>
                    updateItem(categoryIndex, itemIndex, { name: value })
                  }
                  placeholder="이름"
                  size="sm"
                  full
                />

                <button
                  type="button"
                  onClick={() =>
                    updateCategory(categoryIndex, {
                      items: category.items.filter((_, j) => j !== itemIndex),
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] text-text-sub hover:text-point-red"
                >
                  <Trash2 className="h-3 w-3" />
                  삭제
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                updateCategory(categoryIndex, {
                  items: [...category.items, { ...EMPTY_ITEM }],
                })
              }
              className="flex h-[152px] w-28 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-text-sub hover:border-line-strong hover:text-text-main"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">기술 추가</span>
            </button>
          </div>
        </section>
      ))}

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

export default AdminPortfolioStackPage;
