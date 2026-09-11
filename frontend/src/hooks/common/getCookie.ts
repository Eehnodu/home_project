// 역할: 인증 쿠키 읽기 — user_info(base64 JSON) 파싱과 refresh 가능 여부 판별

const getCookie = (name: string): string | undefined => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]*)`));
  return match ? match[2].trim() : undefined;
};

export const parseUserInfo = (authType: "user" | "admin" = "user") => {
  const prefix = authType === "admin" ? "admin_" : "user_";
  const cookie = getCookie(`${prefix}user_info`);
  if (!cookie) return null;

  try {
    /* 서버가 base64(JSON) 로 넣는다. atob 결과는 바이트 문자열이라 그대로 JSON.parse 하면
       한글이 깨진다 — 바이트 배열로 옮겨 UTF-8 로 디코드한다 */
    const binary = atob(cookie.replace(/^"|"$/g, ""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("쿠키 파싱 실패:", e);
    return null;
  }
};

/* refresh_token 은 httponly 라 JS 에서 볼 수 없다. 서버가 같은 만료로 심어 둔
   refresh_exp 표지 쿠키가 있으면 "갱신 시도", 없으면 "바로 로그인" 으로 가른다 */
export const refreshExp = (type: string = "user") => {
  let prefix = "user_";
  if (type == "admin") {
    prefix = "admin_";
  }
  const cookie = getCookie(`${prefix}refresh_exp`);
  if (!cookie) return false;
  return true;
};
