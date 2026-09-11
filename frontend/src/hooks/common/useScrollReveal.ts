// 역할: IntersectionObserver 로 섹션 진입 애니메이션 클래스를 붙이는 훅

import { useEffect, useRef } from "react";

/**
 * 요소가 화면에 들어올 때 .is-visible 을 붙여 진입 애니메이션을 트리거한다.
 * 기존 `section:target` 방식은 해시로 이동한 섹션에서만 동작했기 때문에 교체.
 */
export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            /* 한 번 보였으면 관찰을 끊는다. 스크롤을 되돌려도 다시 사라지지 않게 */
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return ref;
};
