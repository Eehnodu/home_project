// 역할: AuthContext 정의와 접근 훅. Provider 밖에서 쓰면 바로 던져서 실수를 드러낸다

import { AuthContextType } from "@/types/auth";
import { createContext, useContext } from "react";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
