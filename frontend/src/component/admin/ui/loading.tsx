import { useEffect } from "react";
import logo from "@/assets/logo.png";

interface LoadingProps {
  /**
   * 화면을 덮지 않고 그 자리에서만 도는 로딩
   *
   * - 데이터 조회처럼 조작을 막을 이유가 없을 때 사용
   * - 기본값(false)은 전체 오버레이 — 생성·삭제처럼 조작을 막아야 할 때
   */
  inline?: boolean;
  /**
   * 아래에 붙는 문구. 오래 걸리는 일은 무엇을 하는 중인지 적는다.
   * 없으면 아바타만 튄다.
   */
  message?: string;
}

/**
 * 통통 튀는 아바타.
 *
 * 그림자는 공과 같은 주기로 움직인다 — 공이 뜨면 좁고 옅어지고,
 * 바닥에 닿으면 넓고 진해진다. 그래야 떠 있는 것으로 보인다.
 * 애니메이션 정의는 index.css 의 loading-bounce / loading-shadow.
 */
const Bouncer = ({ dark = false }: { dark?: boolean }) => (
  // h-16 = 아바타 48px + 뛰어오르는 높이 16px. 남는 여백이 있으면 아래로 처져 보인다
  <div className="flex flex-col items-center">
    <div className="flex h-16 items-end">
      <img
        src={logo}
        alt=""
        className="loading-bounce h-12 w-12 rounded-full object-cover"
      />
    </div>
    <span
      className={`loading-shadow mt-1 h-1.5 w-10 rounded-[50%] ${
        dark ? "bg-black" : "bg-black dark:bg-white"
      }`}
    />
  </div>
);

const Loading = ({ inline = false, message }: LoadingProps) => {
  useEffect(() => {
    if (inline) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [inline]);

  if (inline) {
    return (
      /* h-full 로 부모 영역을 채운 뒤 가운데 정렬한다.
         flex-1 만 두면 부모가 flex 컨테이너가 아닐 때 높이가 내용만큼만 잡혀
         정렬이 먹지 않고 위쪽에 붙어 보인다. min-h 는 부모가 아주 낮을 때의 바닥. */
      <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 py-12">
        <Bouncer />
        {message && <p className="text-sm text-text-placeholder">{message}</p>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/40">
      <Bouncer dark />
      {message && <p className="text-sm text-white/80">{message}</p>}
    </div>
  );
};

export default Loading;
