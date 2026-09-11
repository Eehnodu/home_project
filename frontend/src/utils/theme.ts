// 역할: 다크 · 라이트 테마 읽기와 적용. 헤더형 · 사이드바형 · 관리자 화면이 같은 저장 키와 같은 전환 방식을 쓴다

export const THEME_KEY = "portfolio-theme";

/** 저장된 값이 있으면 그것을, 없으면 OS 설정을 따른다 */
export const readDarkPreference = (): boolean => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * 테마를 문서에 적용한다.
 *
 * 전역 CSS 가 모든 요소의 색에 200ms 트랜지션을 걸어 두어, 클래스만 바꾸면 요소마다 시작 시점이 조금씩
 * 달라 색이 따로따로 따라오는 것처럼 보인다. 전환 순간에만 theme-switching 을 붙여 트랜지션을 끊고,
 * 새 색이 그려진 다음 프레임에 떼서 이후의 hover 같은 전환은 그대로 살린다.
 */
export const applyTheme = (isDark: boolean) => {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");

  // 강제로 스타일을 한 번 계산시켜 새 색이 즉시 적용되게 한다
  void root.offsetWidth;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove("theme-switching"));
  });
};
