import { NavLink, Outlet } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface Tab {
  label: string;
  to: string;
}

interface TopicLayoutProps {
  tabs: Tab[];
}

const TopicLayout = ({ tabs }: TopicLayoutProps) => {
  const navRef = useRef<HTMLElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = navRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, tabs]);

  const scroll = (dir: "left" | "right") => {
    navRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* 탭 바 */}
      <div className="relative">
        <nav
          ref={navRef}
          className="flex gap-1 border-b border-line overflow-x-auto scrollbar-hide"
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={false}
              className={({ isActive }) =>
                `px-4 py-2 text-base font-medium transition-colors border-b-2 -mb-px shrink-0 whitespace-nowrap ${
                  isActive
                    ? "border-txt-main text-txt-main"
                    : "border-transparent text-txt-sub hover:text-txt-main"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 inset-y-0 w-10 flex items-center justify-center bg-gradient-to-r from-base via-base to-transparent text-txt-sub hover:text-txt-main transition-opacity duration-200 ${
            canLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 inset-y-0 w-10 flex items-center justify-center bg-gradient-to-l from-base via-base to-transparent text-txt-sub hover:text-txt-main transition-opacity duration-200 ${
            canRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
};

export default TopicLayout;
