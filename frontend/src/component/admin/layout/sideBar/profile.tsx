import { LogOut } from "lucide-react";
import { parseUserInfo } from "@/hooks/common/getCookie";

type AdminProfileProps = {
  collapsed: boolean;
  onOpenLogout: () => void;
};

const Profile = ({ collapsed, onOpenLogout }: AdminProfileProps) => {
  const user = parseUserInfo("admin");
  const roleLabel = user?.role === "MD" ? "MD" : "관리자";

  return (
    <div className="flex-shrink-0 border-t border-[#292524] overflow-hidden">
      <div className="group flex items-center h-[62px] relative">
        <div className="flex items-center justify-center w-16 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#292524] flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
        </div>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? "opacity-0 w-0" : "opacity-100 w-full"}`}
        >
          <p className="text-xs font-bold text-white truncate w-28">
            {user?.email ?? ""}
          </p>
          <p className="text-[10px] text-neutral-200/60 truncate w-28">
            {roleLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenLogout}
          className={`shrink-0 text-neutral-200/60 hover:text-red-400 transition-colors duration-200 flex items-center justify-center ${collapsed
            ? "absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 group-hover:bg-[#292524]"
            : "mr-3 p-1.5"
            }`}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Profile;
