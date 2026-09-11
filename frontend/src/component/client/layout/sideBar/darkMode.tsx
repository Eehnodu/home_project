import { Moon, Sun } from "lucide-react";

interface DarkModeProps {
  isDark: boolean;
  handleToggleTheme: () => void;
  collapsed: boolean;
}

const DarkMode = ({ isDark, handleToggleTheme, collapsed }: DarkModeProps) => {
  return (
    <div className="flex-shrink-0 border-t border-[#292524] px-2 py-1 dark:border-zinc-800">
      <button
        type="button"
        onClick={handleToggleTheme}
        className="flex w-full items-center gap-3 rounded-lg pl-4 pr-3 min-h-[44px] py-2 text-sm
        text-neutral-400 transition-colors hover:bg-white/5 hover:text-white/90
        dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white/90"
        aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        aria-pressed={isDark}
      >
        {isDark ? (
          <Sun className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        ) : (
          <Moon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        )}
        <span
          className={`leading-snug whitespace-nowrap transition-all duration-300 ease-in-out ${collapsed ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"}`}
        >
          {isDark ? "라이트 모드" : "다크 모드"}
        </span>
      </button>
    </div>
  );
};

export default DarkMode;