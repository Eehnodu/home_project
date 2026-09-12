// 역할: 클릭해서 올리고 hover 로 지우는 이미지 업로더

import { ImagePlus, Loader2, Trash2 } from "lucide-react";

interface ImagePickerProps {
  /** 미리보기 URL. 없으면 빈 상태로 그린다 */
  previewUrl: string | null;
  onSelectFile: (file: File) => void;
  onRemove: () => void;
  uploading?: boolean;
  /** 정사각형 크기 클래스 (예: "w-32", "w-16") */
  sizeClassName?: string;
  /** 빈 상태에 표시할 짧은 안내 */
  placeholder?: string;
  /** 업로드한 이미지를 꽉 채울지(cover) 여백을 둘지(contain) */
  fit?: "cover" | "contain";
}

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

/**
 * 이미지를 눌러서 바로 올리고, hover 하면 삭제 버튼이 뜨는 업로더.
 * 별도 버튼을 두지 않아 폼이 훨씬 조용해진다.
 *
 * 삭제 버튼은 label 밖에 둔다 — label 안에 있으면 클릭이 파일 선택으로 새어나간다.
 */
const ImagePicker = ({
  previewUrl,
  onSelectFile,
  onRemove,
  uploading = false,
  sizeClassName = "w-32",
  placeholder = "이미지 추가",
  fit = "cover",
}: ImagePickerProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelectFile(file);
    /* 같은 파일을 다시 선택할 수 있게 초기화 */
    event.target.value = "";
  };

  return (
    <div className={`group relative aspect-square shrink-0 ${sizeClassName}`}>
      <label
        className={`flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-line bg-bg-sub transition-colors hover:border-line-strong ${
          uploading ? "pointer-events-none" : ""
        }`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className={`block h-full w-full ${
              fit === "cover" ? "object-cover" : "object-contain p-2"
            }`}
          />
        ) : (
          <span className="flex flex-col items-center gap-1 px-2 text-center text-text-placeholder">
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px] leading-tight">{placeholder}</span>
          </span>
        )}

        <input
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
      </label>

      {/* hover 오버레이 — 이미지가 이미 있을 때만 "바꿀 수 있다"는 걸 알린다 */}
      {previewUrl && !uploading && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-overlay/50 opacity-0 transition-opacity group-hover:opacity-100">
          <ImagePlus className="h-5 w-5 text-white" />
        </span>
      )}

      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-overlay/50">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </span>
      )}

      {/* 삭제 — hover 시 노출 */}
      {previewUrl && !uploading && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="이미지 삭제"
          className="absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-bg-card text-text-sub opacity-0 shadow-sm transition-opacity hover:text-point-red group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default ImagePicker;
