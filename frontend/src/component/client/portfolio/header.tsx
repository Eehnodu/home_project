// 역할: 포트폴리오 상단 헤더 — 섹션 네비(현재 섹션 강조) · 다크모드 토글 · 외부 링크

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, ArrowLeft, Menu, X } from "lucide-react";
import Logo from "@/assets/logo.png";
import { GithubIcon, TistoryIcon } from "@/component/client/portfolio/icons";
import { CONTAINER } from "@/component/client/portfolio/layout";
import { applyTheme, readDarkPreference } from "@/utils/theme";

const navItems = [
  { label: "소개", id: "info" },
  { label: "기술 스택", id: "techstack" },
  { label: "설계 원칙", id: "approach" },
  { label: "프로젝트", id: "project" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProjectList = location.pathname === "/projects";

  /* 저장된 테마가 있으면 그것을, 없으면 OS 설정을 따른다. main.tsx 가 같은 규칙으로 첫 프레임을 맞춘다 */
  const [isDark, setIsDark] = useState(readDarkPreference);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("info");
  const menuRef = useRef<HTMLDivElement>(null);

  /* 테마를 문서에 반영한다. 전환 순간의 트랜지션 끊기와 저장은 공용 헬퍼가 맡는다 */
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  /* 메뉴 바깥 클릭 시 닫기 */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* 스크롤 시 헤더에 경계선 부여 */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* 현재 보고 있는 섹션을 네비에 표시. 여러 섹션이 겹쳐 보이면 가장 많이 보이는 것을 고른다.
     rootMargin 으로 화면 위 20% · 아래 50% 를 잘라내 "화면 가운데 걸린 섹션" 기준으로 판정한다 */
  useEffect(() => {
    if (isProjectList) return;

    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -50% 0px", threshold: [0.1, 0.3, 0.6] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isProjectList]);

  const handleToggleDark = () => setIsDark((prev) => !prev);

  return (
    <header
      /* bg-base 를 불투명하게 둔다. 반투명 + backdrop-blur 는 스크롤 시
         아래 섹션이 헤더에 비쳐 보이는 문제가 있었다. */
      className={`select-none sticky top-0 z-[1000] w-full bg-base transition-colors ${
        scrolled ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <div className={`${CONTAINER} flex h-16 items-center justify-between`}>
        {/* 왼쪽: 뒤로가기 or 로고+이름 */}
        {isProjectList ? (
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm font-medium text-txt-sub transition-colors hover:text-txt-main"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            돌아가기
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={Logo}
              alt=""
              aria-hidden
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="text-lg font-bold tracking-tight text-txt-main">
              Nodu
            </span>
          </Link>
        )}

        {/* 오른쪽 */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 섹션 네비 — 데스크탑만 */}
          {!isProjectList && (
            <nav className="mr-4 hidden sm:block">
              <ul className="flex items-center gap-1">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeId === item.id
                          ? "bg-surface text-txt-main"
                          : "text-txt-sub hover:text-txt-main"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* 다크모드 + 외부 링크 */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleDark}
              className="rounded-lg p-2 text-txt-sub transition-colors hover:bg-surface hover:text-txt-main"
              aria-label={isDark ? "라이트모드로 전환" : "다크모드로 전환"}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <a
              href="https://eehnodu.tistory.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-txt-sub transition-colors hover:bg-surface hover:text-txt-main"
              aria-label="Tistory 블로그"
            >
              <TistoryIcon />
            </a>
            <a
              href="https://github.com/Eehnodu"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-txt-sub transition-colors hover:bg-surface hover:text-txt-main"
              aria-label="GitHub"
            >
              <GithubIcon />
            </a>
          </div>

          {/* 햄버거 — 모바일만 */}
          {!isProjectList && (
            <div className="relative sm:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-lg p-2 text-txt-sub transition-colors hover:bg-surface hover:text-txt-main"
                aria-label="메뉴"
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 flex w-36 flex-col rounded-xl border border-line bg-base py-1 shadow-lg">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setMenuOpen(false)}
                      className={`px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface ${
                        activeId === item.id ? "text-txt-main" : "text-txt-sub"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
