import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Logo from "@/assets/logo.png";
import type { ClientHeaderProps } from "@/types/client/sidebar";

const ClientHeader = ({ getHeaderInfoByPath, onMobileMenuClick }: ClientHeaderProps) => {
  const { pathname } = useLocation();
  const resolved = getHeaderInfoByPath(pathname);
  const LucideOrLogo = resolved.kind === "lucide" ? resolved.Icon : null;

  return (
    <header className="relative flex h-16 shrink-0 items-center border-b border-line bg-surface px-4 md:px-8">
      {onMobileMenuClick && (
        <button
          className="md:hidden p-1.5 rounded-lg text-txt-sub hover:bg-input transition-colors"
          onClick={onMobileMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 md:static md:translate-x-0 md:left-auto">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-line bg-primary-bg">
          {resolved.kind === "logo" ? (
            <img src={Logo} alt="" className="h-6 w-6 object-contain" draggable={false} />
          ) : (
            LucideOrLogo && <LucideOrLogo className="h-4 w-4 text-primary" strokeWidth={1.75} />
          )}
        </div>
        <span className="font-bold text-txt-main">{resolved.label}</span>
      </div>
    </header>
  );
};

export default ClientHeader;
