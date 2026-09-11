// 역할: 포트폴리오 우측 하단 챗봇 위젯 — SSE 스트리밍 수신 · 타이핑 효과 · 세션/방문자 키 관리

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Send, X } from "lucide-react";
import Logo from "@/assets/logo.png";
import { baseURL, useGet } from "@/hooks/common/useAPI";
import type { ChatbotConfig, ChatbotMessageRequest } from "@/types/chatbot";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

/* 관리자가 인사말을 저장하기 전이나 API 가 실패했을 때 쓰는 기본값 */
const DEFAULT_GREETING = "안녕하세요. 궁금한 점을 편하게 물어보세요.";

/* 서버가 메시지 없이 실패했을 때(네트워크 끊김 등) 쓰는 문구 */
const FAILED_REPLY = "답변을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.";

/* 서버에 함께 보내는 이전 대화 수(질문·답변 12쌍). 서버도 같은 수로 자른다 */
const HISTORY_MAX = 24;

/**
 * 타이핑 속도.
 *
 * Gemini 는 40자쯤 되는 덩어리로 보낸다. 도착하는 대로 그리면 뭉텅이가 툭툭
 * 나타나 타이핑처럼 안 보인다. 그래서 받은 글자를 큐에 쌓아두고 이 간격으로
 * 조금씩 꺼내 그린다 — 화면 속도를 네트워크에서 떼어내는 것이 목적이다.
 */
const TYPING_TICK_MS = 22;
const TYPING_MAX_CHARS = 3;

/**
 * 로그인이 없어 두 개의 키로 "누가 물었나" 를 구분한다.
 *
 * - session : sessionStorage. 새로고침은 견디고 탭을 닫으면 사라진다.
 *             사람이 "대화 한 판" 이라고 느끼는 단위와 맞다.
 * - visitor : localStorage. 며칠 뒤 다시 와도 같은 사람으로 묶인다.
 *
 * 시크릿 모드나 저장소 차단이면 읽기·쓰기가 던진다. 그때는 키 없이 보내고
 * 서버가 하나 만들어 쓴다 — 기록에서 아예 빠지는 것보다 낫다.
 */
const SESSION_KEY = "chatbot-session";
const VISITOR_KEY = "chatbot-visitor";

const readOrCreateKey = (storage: "session" | "local", name: string) => {
  try {
    const store = storage === "session" ? sessionStorage : localStorage;
    const saved = store.getItem(name);
    if (saved) return saved;
    const created = crypto.randomUUID().replace(/-/g, "");
    store.setItem(name, created);
    return created;
  } catch {
    return undefined;
  }
};

/**
 * 포트폴리오 우측 하단 챗봇.
 *
 * - 버튼을 누르면 패널이 버튼 위로 펼쳐진다(origin-bottom-right).
 * - 모바일에서는 좌우를 화면 폭에 맞추고 높이를 뷰포트 기준으로 잡아 바텀시트처럼 보인다.
 *   svh 를 써서 주소창이 접히고 펼쳐질 때 높이가 튀지 않는다.
 * - 헤더(z-1000)보다 낮고 모달(z-1100)보다도 낮게 둔다. 프로젝트 모달이 열리면 그 뒤로 간다.
 */
const ChatWidget = () => {
  const { data: config } = useGet<ChatbotConfig>("api/chatbot/config", [
    "chatbot-config",
  ]);
  const greeting = config?.greeting || DEFAULT_GREETING;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  /* 사용자가 보낸 뒤의 대화만 담는다. 인사말은 설정에서 오므로 따로 앞에 붙인다 */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  /* 보내는 중 — 첫 조각이 오기 전까지는 점 3개를, 그 뒤로는 글자가 늘어난다 */
  const [sending, setSending] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* 열리면 입력창에 포커스, 새 메시지가 오면 맨 아래로 */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open, sending]);

  /* Escape 로 닫기 */
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  /* 아직 화면에 안 그린 글자 · 스트림 종료 여부 · 타이머 · 다 그렸을 때 깨울 함수 */
  const pendingRef = useRef("");
  const streamDoneRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const drainedRef = useRef<(() => void) | null>(null);

  const stopTyping = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    drainedRef.current?.();
    drainedRef.current = null;
  };

  /* 위젯이 사라질 때 타이머를 남기지 않는다 */
  useEffect(() => stopTyping, []);

  const startTyping = () => {
    if (timerRef.current !== null) return;
    timerRef.current = window.setInterval(() => {
      const pending = pendingRef.current;
      if (!pending) {
        if (streamDoneRef.current) stopTyping();
        return;
      }
      /* 뒤에 많이 쌓였으면 조금 빠르게 꺼낸다 — 답이 이미 다 와 있는데도
         한 글자씩 치면 기다리는 쪽이 답답하다 */
      const take = Math.min(
        TYPING_MAX_CHARS,
        Math.max(1, Math.ceil(pending.length / 40)),
      );
      pendingRef.current = pending.slice(take);
      setWaiting(false);
      appendToLast(pending.slice(0, take));
    }, TYPING_TICK_MS);
  };

  /* 마지막 풍선에 도착한 조각을 이어붙인다 */
  const appendToLast = (delta: string) =>
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.role !== "assistant") {
        return [...prev, { role: "assistant", text: delta }];
      }
      return [...prev.slice(0, -1), { ...last, text: last.text + delta }];
    });

  /**
   * SSE 로 답을 받아 도착하는 대로 그린다.
   *
   * TanStack Query 의 usePost 를 쓰지 않는다 — 그건 응답을 다 받은 뒤 한 번에
   * 돌려주는 구조라 스트리밍이 안 된다. 답변이 5~15초 걸려서 다 기다리면
   * 멈춘 것처럼 보인다.
   */
  const handleSend = async () => {
    const text = draft.trim();
    /* 답변을 기다리는 중에는 더 보내지 않는다 — 무료 티어 한도가 빠듯하다 */
    if (!text || sending) return;

    /* 인사말은 서버가 알 필요 없다. 실제 주고받은 대화만 보낸다 */
    const history = messages.slice(-HISTORY_MAX);
    const body: ChatbotMessageRequest = {
      message: text,
      history,
      session_key: readOrCreateKey("session", SESSION_KEY),
      visitor_key: readOrCreateKey("local", VISITOR_KEY),
    };
    setMessages((prev) => [...prev, { role: "user", text }]);
    setDraft("");
    setSending(true);
    setWaiting(true);
    pendingRef.current = "";
    streamDoneRef.current = false;

    try {
      const response = await fetch(`${baseURL}/api/chatbot/message/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      /* 스트림이 시작되기 전의 실패(검증 · 호출 제한)는 평소처럼 JSON 으로 온다 */
      if (!response.ok || !response.body) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.message || FAILED_REPLY);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        /* 이벤트는 빈 줄로 나뉜다. 마지막 조각은 아직 덜 왔을 수 있어 남겨둔다 */
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.startsWith("data:")) continue;
          const payload = event.slice("data:".length).trim();
          if (!payload || payload === "[DONE]") continue;

          const chunk = JSON.parse(payload) as { text?: string; error?: string };
          if (chunk.error) throw new Error(chunk.error);
          if (!chunk.text) continue;

          /* 화면에 바로 그리지 않고 큐에 쌓는다. 꺼내 그리는 건 타이머가 한다 */
          pendingRef.current += chunk.text;
          startTyping();
        }
      }

      /* 다 받았어도 아직 그리는 중일 수 있다. 남은 글자를 다 칠 때까지 기다린다 */
      streamDoneRef.current = true;
      await new Promise<void>((resolve) => {
        if (timerRef.current === null) resolve();
        else drainedRef.current = resolve;
      });
    } catch (error) {
      /* 치던 중이었다면 남은 글자를 한 번에 붙이고 멈춘다 */
      streamDoneRef.current = true;
      stopTyping();
      if (pendingRef.current) {
        appendToLast(pendingRef.current);
        pendingRef.current = "";
      }
      /* 실패도 풍선으로 보여준다. 서버가 내려준 사유(한도 초과 등)를 그대로 쓴다 */
      const message = error instanceof Error ? error.message : FAILED_REPLY;
      setMessages((prev) => [...prev, { role: "assistant", text: message }]);
    } finally {
      setSending(false);
      setWaiting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    /* 한글 조합 중 Enter 는 무시한다 — 안 그러면 마지막 글자가 두 번 들어간다 */
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSend();
    }
  };

  /* 관리자가 꺼두면 위젯 자체를 그리지 않는다 */
  if (config && !config.enabled) return null;

  const thread: ChatMessage[] = [{ role: "assistant", text: greeting }, ...messages];

  return (
    <div className="fixed bottom-5 right-4 z-[950] sm:bottom-6 sm:right-6">
      {/* 패널 — 버튼 위로 펼쳐진다.
          라이트모드에서 페이지(zinc-50)와 구분되도록 흰 surface-raised + 진한 테두리 + 큰 그림자 */}
      <div
        className={`fixed bottom-[4.5rem] left-3 right-3 flex flex-col overflow-hidden rounded-2xl border border-line-active bg-surface-raised shadow-[0_24px_64px_-12px_rgba(0,0,0,0.28)] ring-1 ring-black/5 transition-[opacity,transform] duration-200 sm:bottom-[4.75rem] sm:left-auto sm:right-6 sm:w-[24rem] ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        } h-[min(34rem,calc(100svh-6.5rem))] origin-bottom-right`}
        role="dialog"
        aria-label="챗봇"
        aria-hidden={!open}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-3 border-b border-line bg-surface-raised px-4 py-3">
          <img
            src={Logo}
            alt=""
            aria-hidden
            className="h-8 w-8 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight text-txt-main">
              Nodu
            </p>
            <p className="truncate text-xs text-txt-sub">
              프로젝트와 기술 스택에 대해 답해드려요
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="닫기"
            className="rounded-lg p-1.5 text-txt-sub transition-colors hover:bg-surface hover:text-txt-main"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 메시지 */}
        <div
          ref={listRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-base px-4 py-4"
        >
          {thread.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "rounded-br-md bg-txt-main text-txt-inverse"
                    : "rounded-bl-md border border-line bg-surface-raised text-txt-main shadow-sm"
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}

          {/* 답변 대기 — 점 3개. 응답이 10초 넘게 걸릴 때도 있어 표시가 필요하다 */}
          {waiting && (
            <div className="flex justify-start">
              <div
                className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface-raised px-3.5 py-3 shadow-sm"
                role="status"
                aria-label="답변 작성 중"
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-txt-muted"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 입력 */}
        <div className="flex items-center gap-2 border-t border-line bg-surface-raised px-3 py-3">
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            placeholder={
              sending ? "답변을 기다리는 중" : "메시지를 입력하세요"
            }
            className="min-w-0 flex-1 rounded-xl border border-line bg-base px-3.5 py-2 text-sm text-txt-main outline-none transition-colors placeholder:text-txt-muted focus:border-line-active disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            aria-label="보내기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-txt-main text-txt-inverse transition-opacity disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 토글 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "챗봇 닫기" : "챗봇 열기"}
        aria-expanded={open}
        /* 배경색은 열림/닫힘에 따라 바꾸지 않는다 — 클릭 순간 흰색↔검정으로 튀어 깜빡여 보였다.
           scale 은 GPU 레이어로 올려 라운드 가장자리 안티앨리어싱이 흔들리지 않게 한다 */
        className="flex h-11 w-11 transform-gpu items-center justify-center overflow-hidden rounded-full bg-base text-txt-main shadow-lg ring-1 ring-line transition-transform will-change-transform hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
      >
        {/* 닫혀 있을 땐 로고(사이트와 같은 얼굴), 열려 있을 땐 닫기 */}
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <img
            src={Logo}
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
          />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
