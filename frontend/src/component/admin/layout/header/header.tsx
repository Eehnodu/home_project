import { type LucideIcon, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import type { AdminHeaderProps } from "@/types/admin/sidebar";

const AdminHeader = ({ getHeaderInfoByPath, onMobileMenuClick }: AdminHeaderProps) => {
  const { pathname } = useLocation();
  const { label, icon: Icon } = getHeaderInfoByPath(pathname);

  return (
    <header className="relative flex h-16 items-center px-4 md:px-8 border-b border-line shrink-0 bg-surface">
      {onMobileMenuClick && (
        <button
          className="md:hidden p-1.5 rounded-lg text-txt-sub hover:bg-input transition-colors"
          onClick={onMobileMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 md:static md:translate-x-0 md:left-auto md:ml-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-[linear-gradient(to_bottom_right,#CACACA_0%,#FFFFFF_79%)]">
          {Icon ? (
            <Icon className="h-4 w-4 text-txt-sub" />
          ) : (
            <div className="h-1 w-1 rounded-full bg-txt-muted" />
          )}
        </div>
        <span className="font-bold text-txt-main">{label}</span>
      </div>
    </header>
  );
};

export default AdminHeader;
