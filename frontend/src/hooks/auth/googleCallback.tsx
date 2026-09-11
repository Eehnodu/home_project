// 역할: Google OAuth 리다이렉트 콜백. code 를 서버에 넘겨 쿠키를 받고, 팝업이면 부모 창에 알린 뒤 닫는다

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePost } from "../common/useAPI";
import { useAuth } from "../common/useAuth";
import { parseUserInfo } from "../common/getCookie";

interface GoogleProps {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  autoRun?: boolean;
  apiURL: string;
  redirectURL: string;
}

const GoogleCallback = ({
  onSuccess,
  onError,
  autoRun = true,
  apiURL,
  redirectURL,
}: GoogleProps) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  /* StrictMode 는 effect 를 두 번 돌린다. 인가 코드는 한 번만 쓸 수 있어 두 번째 호출을 막는다 */
  const hasRun = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const searchParams = new URL(window.location.toString()).searchParams;
  const code = searchParams.get("code");
  const stateStr = searchParams.get("state");

  const googleLogin = usePost<{ code: string }, unknown>(apiURL);

  const googleLoginAction = async () => {
    if (!code || hasRun.current) return;
    hasRun.current = true;

    try {
      const data = await googleLogin.mutateAsync({ code });
      const updatedUser = parseUserInfo();
      let nextPath = "/admin";
      let isPopup = false;

      if (stateStr) {
        try {
          const decodedState = JSON.parse(decodeURIComponent(stateStr));
          nextPath = decodedState.next || "/admin";
          isPopup = decodedState.isPopup || false;
        } catch (e) {
          console.error("State parsing error:", e);
        }
      }

      if (isPopup && window.opener) {
        /* 팝업으로 열렸으면 쿠키는 이미 같은 출처에 심어졌다. 부모 창에 알리고 닫기만 한다 */
        window.opener.postMessage(
          {
            type: "GOOGLE_LOGIN_SUCCESS",
            next: nextPath,
          },
          window.location.origin,
        );
        window.close();
      } else {
        setUser(updatedUser);
        if (onSuccess) onSuccess(data);

        const finalDestination = nextPath || redirectURL;
        navigate(finalDestination, { replace: true });
      }
    } catch (err) {
      console.error("로그인 API 호출 실패:", err);
      hasRun.current = false;
      const e = err as { status?: number; message?: string };
      if (e.status === 403) {
        setErrorMsg("접근할 수 없는 계정입니다.");
      } else {
        setErrorMsg("로그인 중 오류가 발생했습니다.");
      }
      if (onError) onError(err);
    }
  };

  useEffect(() => {
    if (autoRun) googleLoginAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (errorMsg) {
    const isPopupWindow = !!window.opener;
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white fixed inset-0 z-50">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl">
            🚫
          </div>
          <p className="text-gray-800 font-semibold text-base">{errorMsg}</p>
          <button
            onClick={() => isPopupWindow ? window.close() : navigate("/admin/login", { replace: true })}
            className="mt-2 text-sm text-gray-500 underline underline-offset-2"
          >
            {isPopupWindow ? "창 닫기" : "돌아가기"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white fixed inset-0 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-client-primary border-t-transparent" />
        <p className="text-slate-500 font-bold text-sm">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
