// 역할: 관리자 — 챗봇 지침(시스템 프롬프트) · 인사말 · 사용 여부 설정

import { useEffect, useState } from "react";
import { Cpu, Save } from "lucide-react";
import Button from "@/component/admin/ui/form/button";
import InputBox from "@/component/admin/ui/form/inputbox";
import TextareaBox from "@/component/admin/ui/form/textareaBox";
import Toggle from "@/component/admin/ui/form/toggle";
import Toast from "@/component/admin/ui/feedback/toast";
import PageSkeleton from "@/component/admin/ui/pageSkeleton";
import { useGet, usePost } from "@/hooks/common/useAPI";
import type { ChatbotSetting } from "@/types/chatbot";

const EMPTY: ChatbotSetting = {
  model: "",
  enabled: true,
  instruction: "",
  greeting: "",
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

/**
 * 챗봇 프롬프트 설정. 모델은 서버 코드에 고정돼 있어 표시만 하고,
 * 지침(시스템 프롬프트) · 인사말 · 사용 여부를 저장한다.
 */
const AdminChatbotSettingPage = () => {
  const { data, isLoading } = useGet<ChatbotSetting>("api/chatbot/setting", [
    "chatbot-setting",
  ]);

  const [form, setForm] = useState<ChatbotSetting>(EMPTY);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    title: string;
  } | null>(null);

  const save = usePost<Omit<ChatbotSetting, "model">, ChatbotSetting>(
    "api/chatbot/setting",
  );

  useEffect(() => {
    if (data) setForm({ ...EMPTY, ...data });
  }, [data]);

  const update = <K extends keyof ChatbotSetting>(
    key: K,
    value: ChatbotSetting[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () =>
    save.mutate(
      {
        enabled: form.enabled,
        instruction: form.instruction,
        greeting: form.greeting,
      },
      {
        onSuccess: (result) => {
          setForm({ ...EMPTY, ...result });
          setToast({ type: "success", title: "저장했습니다." });
        },
        onError: (error) =>
          setToast({ type: "error", title: error?.message ?? "저장 실패" }),
      },
    );

  if (isLoading) return <PageSkeleton variant="form" />;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-center justify-end gap-3">
        <span className="mr-auto inline-flex items-center gap-2 rounded-lg border border-line bg-bg-card px-3 py-1.5 text-xs text-text-sub">
          <Cpu className="h-3.5 w-3.5" />
          모델
          <code className="font-mono text-text-main">{form.model || "-"}</code>
          <span className="text-text-placeholder">· 코드에서 고정</span>
        </span>
        <Button
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSave}
          disabled={save.isPending}
        >
          {save.isPending ? "저장 중..." : "저장"}
        </Button>
      </div>

      <Section
        title="사용 여부"
        action={
          <label className="flex cursor-pointer items-center gap-3">
            <span className="text-xs text-text-sub">
              {form.enabled ? "공개 화면에 위젯이 보입니다" : "위젯을 숨깁니다"}
            </span>
            <Toggle
              checked={form.enabled}
              onChange={(checked) => update("enabled", checked)}
              size="sm"
            />
          </label>
        }
      >
        <p className="text-xs text-text-sub">
          꺼두면 포트폴리오 우측 하단 버튼이 사라지고 답변 API 도 응답하지 않습니다.
        </p>
      </Section>

      <Section title="지침 (시스템 프롬프트)">
        <Field
          label="지침"
          hint={`답변 톤 · 범위 · 금지사항 · ${form.instruction.length.toLocaleString()} / 8,000자`}
        >
          <TextareaBox
            value={form.instruction}
            onChange={(value) => update("instruction", value)}
            rows={14}
            placeholder="너는 개발자 Nodu 의 포트폴리오 안내 챗봇이다. ..."
          />
        </Field>
      </Section>

      <Section title="인사말">
        <Field label="첫 메시지" hint="위젯을 열면 먼저 보이는 말 · 300자">
          <InputBox
            value={form.greeting}
            onChange={(value) => update("greeting", value)}
            placeholder="안녕하세요. 편하게 물어보세요."
            full
          />
        </Field>
      </Section>

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

export default AdminChatbotSettingPage;
