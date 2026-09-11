// 역할: fetch 래퍼 — useGet / usePost 와 401 시 토큰 자동 갱신 후 1회 재시도

import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";

// baseURL 설정
export const hostname = window.location.hostname;

export const baseURL = import.meta.env.VITE_APP_PUBLIC_BASE_URL;

// 공통 응답 타입
export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode: string;
}

/**
 * Refresh Token을 사용해 세션을 갱신하는 함수
 *
 * 현재 경로가 `/admin`으로 시작하면 admin refresh API를,
 * 그 외에는 user refresh API를 호출합니다.
 *
 * 쿠키 기반(refresh_token)를 사용하며,
 * credentials: "include"로 요청됩니다.
 *
 * 주의
 * - refresh API가 401을 반환해도 throw 하지 않습니다.
 * - 항상 true를 반환합니다.
 * - redirect / logout 처리는 호출 측에서 판단해야 합니다.
 *
 * @returns {() => Promise<boolean>}
 * refresh 요청을 수행하는 비동기 함수
 *
 * @example
 * const refreshToken = useRefreshToken();
 * await refreshToken();
 */
export const useRefreshToken = () => {
  const { pathname } = window.location;

  const refreshUrl = pathname.startsWith("/admin")
    ? "api/auth/refresh_token_admin"
    : pathname.startsWith("/agent")
      ? "api/auth/refresh_token_agent"
      : pathname.startsWith("/groupguide")
        ? "api/auth/refresh_token_docent"
        : "api/auth/refresh_token";

  const refresh = async () => {
    await fetch(`${baseURL}/${refreshUrl}`, {
      method: "POST",
      credentials: "include",
    });
  };

  return refresh;
};

/**
 * React Query 기반 GET 요청 훅
 *
 * 자동으로 401 응답 시 refreshToken()을 호출하고,
 * 재시도까지 해주는 fetch 래퍼입니다.
 *
 * @template T 응답 데이터의 타입
 *
 * @param url API endpoint
 * @param key React Query의 queryKey (배열 형태, 직렬화 가능한 값만 가능)
 * @param enabled 쿼리 실행 여부 (기본값: true)
 * @example
 * const { data, isLoading, error } = useGet<User[]>("/users", ["users"]);
 */
export const useGet = <T>(
  url: string,
  key: (string | number)[],
  enabled: boolean = true,
) => {
  const refreshToken = useRefreshToken();

  return useQuery<T>({
    queryKey: key,
    enabled,
    queryFn: async () => {
      const makeRequest = async () => {
        return await fetch(`${baseURL}/${url}`, {
          credentials: "include",
        });
      };

      let response = await makeRequest();

      /* access 토큰(1시간)이 만료된 경우. refresh 후 한 번만 다시 보낸다 —
         refresh 도 만료됐다면 두 번째 응답이 그대로 오류로 떨어져 호출부가 처리한다 */
      if (response.status === 401) {
        await refreshToken();
        response = await makeRequest();
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API 오류 ${response.status}: ${text}`);
      }
      const json = (await response.json()) as BaseResponse<T>;

      if (!json.success) {
        throw new Error(json.message || "API Error");
      }

      return json.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    /* 5분 안에는 같은 키를 다시 마운트해도 캐시를 쓴다. 저장 뒤에는 invalidateQueries 로 갱신한다 */
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

/**
 * React Query 기반 POST 요청 훅
 *
 * 자동으로 401 응답 시 refreshToken()을 호출하고,
 * 재시도까지 해주는 fetch 래퍼입니다.
 *
 * @template TResponse 응답 데이터 타입
 * @template TRequest 요청 바디 타입 (object, FormData, void)
 * @template TError 에러 타입 (기본: { status?: number; message?: string })
 *
 * @param url API endpoint
 *
 * @example
 * // JSON Body 요청
 * const createUser = usePost<UserResponse, { name: string; email: string }>("/users");
 * createUser.mutate({ name: "홍길동", email: "hong@example.com" });
 *
 * @example
 * // FormData 요청 (파일 업로드)
 * const uploadFile = usePost<{ url: string }, FormData>("/upload");
 * const fd = new FormData();
 * fd.append("file", fileInput.files[0]);
 * uploadFile.mutate(fd);
 *
 * @example
 * // 바디 없는 POST (예: 로그아웃)
 * const logout = usePost<void, void>("/auth/logout");
 * logout.mutate();
 */
export const usePost = <
  TRequest extends object | FormData | void,
  TResponse,
  TError = { status?: number; message?: string },
>(
  url: string,
) => {
  const refreshToken = useRefreshToken();

  return useMutation<TResponse, TError, TRequest>({
    mutationFn: async (body: TRequest) => {
      const headers: HeadersInit = {};
      let fetchBody: BodyInit;

      if (body instanceof FormData) {
        /* Content-Type 을 직접 넣지 않는다. boundary 가 붙은 값은 브라우저만 만들 수 있다 */
        fetchBody = body;
      } else {
        fetchBody = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
      }

      const makeRequest = async () => {
        return await fetch(`${baseURL}/${url}`, {
          method: "POST",
          headers,
          credentials: "include",
          body: fetchBody,
        });
      };

      let response = await makeRequest();

      /* access 토큰(1시간)이 만료된 경우. refresh 후 한 번만 다시 보낸다 —
         refresh 도 만료됐다면 두 번째 응답이 그대로 오류로 떨어져 호출부가 처리한다 */
      if (response.status === 401) {
        await refreshToken();
        response = await makeRequest();
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = null;
        }
        throw {
          status: response.status,
          message: errorData?.message || errorData?.detail || errorText || "Something went wrong",
        } as TError;
      }

      // 204, 205 등 No Content 응답일 경우 안전하게 처리
      if (response.status === 204 || response.status === 205) {
        return null as unknown as TResponse;
      }

      const json = (await response.json()) as BaseResponse<TResponse>;

      if (!json.success) {
        throw {
          status: response.status,
          message: json.message || "API Error",
        } as TError;
      }

      return json.data;
    },
  });
};
