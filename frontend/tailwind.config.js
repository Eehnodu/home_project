/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ─────────────────────────────────────────────────────────
         * base 레포(Eehnodu/base)의 색 체계를 그대로 가져왔다.
         * rgb(var(--x) / <alpha-value>) 형태라 투명도(`bg-bg-card/50`)가 먹는다.
         * ───────────────────────────────────────────────────────── */

        // Admin 버튼 전용 색 — 다크모드에서 확실히 뜨도록 별도 토큰을 쓴다
        main: {
          DEFAULT: "rgb(var(--btn-main) / <alpha-value>)",
          hover: "rgb(var(--btn-main-hover) / <alpha-value>)",
          active: "rgb(var(--btn-main-active) / <alpha-value>)",
        },
        sub1: {
          DEFAULT: "rgb(var(--btn-sub1) / <alpha-value>)",
          hover: "rgb(var(--btn-sub1-hover) / <alpha-value>)",
          active: "rgb(var(--btn-sub1-active) / <alpha-value>)",
        },
        sub2: {
          DEFAULT: "rgb(var(--btn-sub2) / <alpha-value>)",
          hover: "rgb(var(--btn-sub2-hover) / <alpha-value>)",
          active: "rgb(var(--btn-sub2-active) / <alpha-value>)",
        },

        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          light: "rgb(var(--primary-light) / <alpha-value>)",
          dark: "rgb(var(--primary-dark) / <alpha-value>)",
          /* 구버전 별칭 — 기존 코드가 primary-hover / primary-bg 를 쓴다 */
          hover: "rgb(var(--btn-main-hover) / <alpha-value>)",
          bg: "rgb(var(--primary-light) / <alpha-value>)",
        },

        bg: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
          sub: "rgb(var(--bg-sub) / <alpha-value>)",
          hover: "rgb(var(--bg-hover) / <alpha-value>)",
          active: "rgb(var(--bg-active) / <alpha-value>)",
          disabled: "rgb(var(--bg-disabled) / <alpha-value>)",
        },

        text: {
          main: "rgb(var(--text-main) / <alpha-value>)",
          sub: "rgb(var(--text-sub) / <alpha-value>)",
          disabled: "rgb(var(--text-disabled) / <alpha-value>)",
          placeholder: "rgb(var(--text-placeholder) / <alpha-value>)",
          inverse: "rgb(var(--text-inverse) / <alpha-value>)",
        },

        line: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          strong: "rgb(var(--border-strong) / <alpha-value>)",
          focus: "rgb(var(--border-focus) / <alpha-value>)",
          /* 구버전 별칭 */
          active: "rgb(var(--border-strong) / <alpha-value>)",
        },

        input: {
          /* DEFAULT 는 구버전 `bg-input` 을 위해 남긴다 */
          DEFAULT: "rgb(var(--input-bg) / <alpha-value>)",
          bg: "rgb(var(--input-bg) / <alpha-value>)",
          border: "rgb(var(--input-border) / <alpha-value>)",
        },

        point: {
          green: "rgb(var(--point-green) / <alpha-value>)",
          red: "rgb(var(--point-red) / <alpha-value>)",
          amber: "rgb(var(--point-amber) / <alpha-value>)",
          blue: "rgb(var(--point-blue) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--point-green) / <alpha-value>)",
          bg: "rgb(var(--success-bg) / <alpha-value>)",
        },
        error: {
          DEFAULT: "rgb(var(--point-red) / <alpha-value>)",
          bg: "rgb(var(--error-bg) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--point-amber) / <alpha-value>)",
          bg: "rgb(var(--warning-bg) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--point-blue) / <alpha-value>)",
          bg: "rgb(var(--info-bg) / <alpha-value>)",
        },

        overlay: "rgb(var(--overlay) / <alpha-value>)",
        skeleton: {
          base: "rgb(var(--skeleton-base) / <alpha-value>)",
          shine: "rgb(var(--skeleton-shine) / <alpha-value>)",
        },

        /* ─────────────────────────────────────────────────────────
         * 구버전 별칭 — 기존 43개 파일이 쓰는 이름을 새 변수에 연결한다.
         * 한 번에 전부 바꾸면 기존 화면이 함께 깨지므로 남겨둔다.
         * ───────────────────────────────────────────────────────── */
        base: "rgb(var(--bg) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--bg-card) / <alpha-value>)",
          raised: "rgb(var(--surface-raised) / <alpha-value>)",
        },
        txt: {
          main: "rgb(var(--text-main) / <alpha-value>)",
          sub: "rgb(var(--text-sub) / <alpha-value>)",
          muted: "rgb(var(--text-disabled) / <alpha-value>)",
          inverse: "rgb(var(--text-inverse) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
