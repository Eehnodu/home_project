// 역할: 로그인 상태면 접근하지 못하게 돌려보내는 라우트 가드 (로그인 페이지용)

import { Navigate } from "react-router-dom";
import { useAuth } from "../common/useAuth";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute = ({
  children,
  redirectTo = "/admin",
}: PublicRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="w-full h-screen bg-white" />;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
