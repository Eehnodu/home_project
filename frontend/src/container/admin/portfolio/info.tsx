// 역할: 관리자 — Info 섹션(프로필 · 소개 · 태그 · 링크) 편집. 이미지는 즉시 업로드, DB 반영은 저장 버튼

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import Button from "@/component/admin/ui/form/button";
import InputBox from "@/component/admin/ui/form/inputbox";
import TextareaBox from "@/component/admin/ui/form/textareaBox";
import SelectBox from "@/component/admin/ui/form/selectBox";
import Toast from "@/component/admin/ui/feedback/toast";
import PageSkeleton from "@/component/admin/ui/pageSkeleton";
import ImagePicker from "@/component/admin/portfolio/imagePicker";
import { useGet, usePost } from "@/hooks/common/useAPI";
import { mediaUrl } from "@/utils/media";
import type {
  PortfolioCareer,
  PortfolioCertificate,
  PortfolioEducation,
  PortfolioInfo,
  PortfolioLink,
} from "@/types/portfolio";

const EMPTY_INFO: PortfolioInfo = {
  subtitle: "",
  role_label: "",
  name: "",
  headline: "",
  description: "",
  profile_image: null,
  tags: [],
  links: [],
  careers: [],
  educations: [],
  certificates: [],
  layout: "header",
};

/* 공개 화면 구성. 값은 백엔드와 같은 문자열 */
const LAYOUT_OPTIONS = [
  { label: "헤더형 — 상단 메뉴, 한 페이지로 스크롤", value: "header" },
  { label: "사이드바형 — 왼쪽 메뉴, 페이지 넷", value: "sidebar" },
];

const EMPTY_CAREER: PortfolioCareer = { org: "", role: "", period: "", items: [] };
const EMPTY_EDUCATION: PortfolioEducation = { school: "", major: "", period: "" };
const EMPTY_CERTIFICATE: PortfolioCertificate = { name: "", issuer: "", date: "" };

const EMPTY_LINK: PortfolioLink = {
  label: "",
  sub: "",
  href: "",
  icon_image: null,
};

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

const Section = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-4 rounded-xl border border-line bg-bg-card p-5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-text-main">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const AdminPortfolioInfoPage = () => {
  const { data, isLoading } = useGet<PortfolioInfo>("api/portfolio/info", [
    "portfolio-info",
  ]);

  const [form, setForm] = useState<PortfolioInfo>(EMPTY_INFO);
  const [tagInput, setTagInput] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    title: string;
  } | null>(null);

  /* 어느 칸을 올리는 중인지 — 그 칸에만 로딩을 보여준다 */
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingLink, setUploadingLink] = useState<number | null>(null);

  const save = usePost<PortfolioInfo, PortfolioInfo>("api/portfolio/info");
  const uploadImage = usePost<FormData, { path: string }>(
    "api/portfolio/info/image",
  );

  useEffect(() => {
    if (data) setForm({ ...EMPTY_INFO, ...data });
  }, [data]);

  const update = <K extends keyof PortfolioInfo>(
    key: K,
    value: PortfolioInfo[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  /* 경력 · 학력 · 자격증처럼 행 목록인 필드의 한 행만 바꾼다 */
  const updateRow = <K extends "careers" | "educations" | "certificates">(
    key: K,
    index: number,
    patch: Partial<PortfolioInfo[K][number]>,
  ) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));

  const handleLinkChange = <K extends keyof PortfolioLink>(
    index: number,
    key: K,
    value: PortfolioLink[K],
  ) =>
    update(
      "links",
      form.links.map((link, i) =>
        i === index ? { ...link, [key]: value } : link,
      ),
    );

  /* 업로드는 파일만 저장한다. DB 반영은 저장 버튼을 눌러야 일어난다 */
  const upload = (
    file: File,
    kind: "profile" | "link",
    onDone: (path: string) => void,
    onSettled: () => void,
  ) => {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);

    uploadImage.mutate(body, {
      onSuccess: (result) => {
        onDone(result.path);
        setToast({ type: "success", title: "올렸습니다. 저장을 눌러주세요." });
      },
      onError: (error) =>
        setToast({ type: "error", title: error?.message ?? "업로드 실패" }),
      onSettled,
    });
  };

  const handleAddTag = () => {
    const label = tagInput.trim();
    if (!label || form.tags.includes(label)) return;
    update("tags", [...form.tags, label]);
    setTagInput("");
  };

  const handleSave = () =>
    save.mutate(form, {
      onSuccess: () => setToast({ type: "success", title: "저장했습니다." }),
      onError: (error) =>
        setToast({ type: "error", title: error?.message ?? "저장 실패" }),
    });

  if (isLoading) return <PageSkeleton variant="form" />;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex justify-end">
        <Button
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSave}
          disabled={save.isPending}
        >
          {save.isPending ? "저장 중..." : "저장"}
        </Button>
      </div>

      <Section title="화면 구성">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="공개 화면" hint="저장하면 방문자 화면이 바로 바뀐다">
            <SelectBox
              value={form.layout}
              onChange={(value) => update("layout", value as PortfolioInfo["layout"])}
              options={LAYOUT_OPTIONS}
            />
          </Field>
        </div>
      </Section>

      {/* 프로필과 짧은 한 줄 값들을 한 덩어리로 묶는다 */}
      <Section title="기본 정보">
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
          <div className="flex flex-col items-center gap-2">
            <ImagePicker
              previewUrl={mediaUrl(form.profile_image)}
              onSelectFile={(file) => {
                setUploadingProfile(true);
                upload(
                  file,
                  "profile",
                  (path) => update("profile_image", path),
                  () => setUploadingProfile(false),
                );
              }}
              onRemove={() => update("profile_image", null)}
              uploading={uploadingProfile}
              sizeClassName="w-32"
              placeholder="프로필 추가"
            />
            <span className="text-[11px] text-text-sub">최대 5MB</span>
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="섹션 설명" hint="제목 아래 한 줄">
              <InputBox
                value={form.subtitle}
                onChange={(value) => update("subtitle", value)}
                placeholder="저에 대한 소개입니다."
                full
              />
            </Field>
            <Field label="직무 라벨">
              <InputBox
                value={form.role_label}
                onChange={(value) => update("role_label", value)}
                placeholder="Web Developer"
                full
              />
            </Field>
            <Field label="이름" hint="아바타 옆 표시">
              <InputBox
                value={form.name}
                onChange={(value) => update("name", value)}
                placeholder="Nodu"
                full
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="소개 문구">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="헤드라인" hint="줄바꿈이 그대로 반영">
            <TextareaBox
              value={form.headline}
              onChange={(value) => update("headline", value)}
              rows={4}
            />
          </Field>
          <Field label="소개 문단" hint="줄바꿈 하나가 문단 하나">
            <TextareaBox
              value={form.description}
              onChange={(value) => update("description", value)}
              rows={4}
            />
          </Field>
        </div>
      </Section>

      <Section title="태그">
        <div className="flex flex-wrap items-center gap-2">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-text-main"
            >
              {tag}
              <button
                type="button"
                onClick={() =>
                  update(
                    "tags",
                    form.tags.filter((one) => one !== tag),
                  )
                }
                className="text-text-sub hover:text-text-main"
                aria-label={`${tag} 삭제`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {form.tags.length === 0 && (
            <span className="text-xs text-text-sub">
              등록된 태그가 없습니다.
            </span>
          )}
        </div>

        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleAddTag();
          }}
        >
          <InputBox
            value={tagInput}
            onChange={setTagInput}
            placeholder="태그 입력 후 Enter"
            full
          />
          <Button
            type="submit"
            variant="sub2"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            추가
          </Button>
        </form>
      </Section>

      <Section
        title="링크 카드"
        action={
          <Button
            variant="sub2"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => update("links", [...form.links, { ...EMPTY_LINK }])}
          >
            링크 추가
          </Button>
        }
      >
        {form.links.length === 0 && (
          <span className="text-xs text-text-sub">등록된 링크가 없습니다.</span>
        )}

        <div className="flex flex-col gap-3">
          {form.links.map((link, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-lg border border-line p-4 sm:flex-row sm:items-start"
            >
              <ImagePicker
                previewUrl={mediaUrl(link.icon_image)}
                onSelectFile={(file) => {
                  setUploadingLink(index);
                  upload(
                    file,
                    "link",
                    (path) => handleLinkChange(index, "icon_image", path),
                    () => setUploadingLink(null),
                  );
                }}
                onRemove={() => handleLinkChange(index, "icon_image", null)}
                uploading={uploadingLink === index}
                sizeClassName="w-16"
                placeholder="아이콘"
                fit="contain"
              />

              <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="제목">
                  <InputBox
                    value={link.label}
                    onChange={(value) =>
                      handleLinkChange(index, "label", value)
                    }
                    placeholder="GitHub"
                    full
                  />
                </Field>
                <Field label="보조 텍스트">
                  <InputBox
                    value={link.sub}
                    onChange={(value) => handleLinkChange(index, "sub", value)}
                    placeholder="github.com/Eehnodu"
                    full
                  />
                </Field>
                <Field label="주소">
                  <InputBox
                    value={link.href}
                    onChange={(value) => handleLinkChange(index, "href", value)}
                    placeholder="https://github.com/Eehnodu"
                    full
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={() =>
                  update(
                    "links",
                    form.links.filter((_, i) => i !== index),
                  )
                }
                aria-label="링크 삭제"
                className="shrink-0 self-end text-text-sub hover:text-point-red sm:mt-7 sm:self-start"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="경력"
        action={
          <Button
            variant="sub2"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => update("careers", [...form.careers, { ...EMPTY_CAREER }])}
          >
            경력 추가
          </Button>
        }
      >
        {form.careers.length === 0 && (
          <span className="text-xs text-text-sub">등록된 경력이 없습니다.</span>
        )}
        <div className="flex flex-col gap-3">
          {form.careers.map((career, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-lg border border-line p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="회사">
                  <InputBox
                    value={career.org}
                    onChange={(value) => updateRow("careers", index, { org: value })}
                    placeholder="회사명"
                    full
                  />
                </Field>
                <Field label="직무">
                  <InputBox
                    value={career.role}
                    onChange={(value) => updateRow("careers", index, { role: value })}
                    placeholder="풀스택 개발자"
                    full
                  />
                </Field>
                <Field label="기간">
                  <InputBox
                    value={career.period}
                    onChange={(value) => updateRow("careers", index, { period: value })}
                    placeholder="2025.02 ~"
                    full
                  />
                </Field>
              </div>
              <Field label="한 일" hint="한 줄에 하나">
                <TextareaBox
                  value={career.items.join("\n")}
                  onChange={(value) =>
                    updateRow("careers", index, {
                      items: value.split("\n").map((line) => line.trimEnd()),
                    })
                  }
                  rows={3}
                />
              </Field>
              <button
                type="button"
                onClick={() => update("careers", form.careers.filter((_, i) => i !== index))}
                aria-label="경력 삭제"
                className="self-end text-text-sub hover:text-point-red"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section
          title="학력"
          action={
            <Button
              variant="sub2"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() =>
                update("educations", [...form.educations, { ...EMPTY_EDUCATION }])
              }
            >
              추가
            </Button>
          }
        >
          {form.educations.length === 0 && (
            <span className="text-xs text-text-sub">등록된 학력이 없습니다.</span>
          )}
          <div className="flex flex-col gap-3">
            {form.educations.map((edu, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-lg border border-line p-4">
                <Field label="학교">
                  <InputBox
                    value={edu.school}
                    onChange={(value) => updateRow("educations", index, { school: value })}
                    full
                  />
                </Field>
                <Field label="학부 · 전공">
                  <InputBox
                    value={edu.major}
                    onChange={(value) => updateRow("educations", index, { major: value })}
                    full
                  />
                </Field>
                <Field label="기간">
                  <InputBox
                    value={edu.period}
                    onChange={(value) => updateRow("educations", index, { period: value })}
                    placeholder="2024.03 졸업"
                    full
                  />
                </Field>
                <button
                  type="button"
                  onClick={() =>
                    update("educations", form.educations.filter((_, i) => i !== index))
                  }
                  aria-label="학력 삭제"
                  className="self-end text-text-sub hover:text-point-red"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="자격증"
          action={
            <Button
              variant="sub2"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() =>
                update("certificates", [...form.certificates, { ...EMPTY_CERTIFICATE }])
              }
            >
              추가
            </Button>
          }
        >
          {form.certificates.length === 0 && (
            <span className="text-xs text-text-sub">등록된 자격증이 없습니다.</span>
          )}
          <div className="flex flex-col gap-3">
            {form.certificates.map((cert, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-lg border border-line p-4">
                <Field label="자격증">
                  <InputBox
                    value={cert.name}
                    onChange={(value) => updateRow("certificates", index, { name: value })}
                    full
                  />
                </Field>
                <Field label="발급 기관">
                  <InputBox
                    value={cert.issuer}
                    onChange={(value) => updateRow("certificates", index, { issuer: value })}
                    full
                  />
                </Field>
                <Field label="취득일" hint="비우면 표시하지 않음">
                  <InputBox
                    value={cert.date}
                    onChange={(value) => updateRow("certificates", index, { date: value })}
                    placeholder="2024.06"
                    full
                  />
                </Field>
                <button
                  type="button"
                  onClick={() =>
                    update("certificates", form.certificates.filter((_, i) => i !== index))
                  }
                  aria-label="자격증 삭제"
                  className="self-end text-text-sub hover:text-point-red"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>
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

export default AdminPortfolioInfoPage;
