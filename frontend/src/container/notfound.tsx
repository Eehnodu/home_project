// 역할: 404 페이지

import { useNavigate } from "react-router-dom";
import { Home, MapPinOff } from "lucide-react";

import Button from "@/component/client/ui/form/button";

/** notfound.gif 의 배경색과 같은 값. 다르면 GIF 의 사각 테두리가 드러난다 */
const NOT_FOUND_BG = "#0c0c14";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-white"
      style={{ backgroundColor: NOT_FOUND_BG }}
    >
      {/* 가장자리만 살짝 어둡게 — 중앙(GIF) 톤은 그대로 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: "inset 0 0 min(45vw, 280px) rgba(0,0,0,0.45)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <h1
          className="mb-2 bg-gradient-to-b from-white via-white to-white/35 bg-clip-text font-bold leading-[0.85] tracking-tight text-transparent sm:leading-none"
          style={{ fontSize: "clamp(4.5rem, 18vw, 9rem)" }}
        >
          404
        </h1>

        <div className="mb-10 h-px w-16 bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />

        <div className="mb-10 space-y-2">
          <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            페이지를 찾을 수 없습니다
          </p>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-white/45 sm:text-base">
            주소가 잘못되었거나 삭제된 페이지입니다.
          </p>
        </div>

        <div
          className="mb-10 rounded-2xl p-3"
          style={{ backgroundColor: NOT_FOUND_BG }}
        >
          <img
            src="/notfound.gif"
            alt="404 안내"
            className="mx-auto w-36 select-none sm:w-44 md:w-52"
            width={208}
            height={208}
            draggable={false}
          />
        </div>

        <Button
          variant="main"
          size="lg"
          leftIcon={<Home strokeWidth={2} />}
          className="border-white/20 !bg-white/5 !text-white backdrop-blur-sm hover:!border-white/30 hover:!bg-white/10"
          onClick={() => navigate("/")}
        >
          메인으로 이동
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
