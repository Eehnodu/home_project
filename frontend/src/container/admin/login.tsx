// 역할: 관리자 로그인 페이지. 이미 admin 으로 로그인돼 있으면 바로 /admin 으로

import { Navigate } from "react-router-dom";
import { parseUserInfo } from "@/hooks/common/getCookie";
import LoginVisual from "@/component/admin/layout/login/loginVisual";
import GoogleLoginPopupBtn from "@/hooks/auth/googleLoginPopupBtn";
import Logo from "@/assets/logo.png";

const LoginPage = () => {
  const user = parseUserInfo("admin");

  if (user?.auth_type === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-base flex font-sans overflow-hidden text-txt-main">
      <LoginVisual />

      <div className="w-full lg:w-2/5 xl:w-1/3 flex items-center justify-center px-6 sm:px-16 lg:px-12 xl:px-16">
        <div className="w-full max-w-sm flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <img src={Logo} alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">관리자 로그인</h3>
            <p className="text-txt-sub font-medium">
              Google 계정으로 로그인해 주세요.
            </p>
          </div>

          <GoogleLoginPopupBtn />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
