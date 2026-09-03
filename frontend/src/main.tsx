// 역할: React 진입점. 첫 렌더 전에 테마 클래스를 먼저 결정한다

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/* React 가 그리기 전에 html 에 dark 클래스를 넣는다. 컴포넌트 안에서 하면
   첫 프레임이 라이트로 그려진 뒤 바뀌어 번쩍인다. 저장값 → 없으면 OS 설정 */
(() => {
  const saved = localStorage.getItem("portfolio-theme");
  const dark =
    saved === "dark"
      ? true
      : saved === "light"
        ? false
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
})();

createRoot(document.getElementById("root")!).render(<App />);
