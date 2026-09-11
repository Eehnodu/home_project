// 역할: DB 의 media/ 상대경로를 화면용 절대 URL 로

import { baseURL } from "@/hooks/common/useAPI";

/**
 * DB 에는 `media/...` 상대경로만 저장되므로, 화면에서 쓸 때 API 주소를 앞에 붙인다.
 * 값이 없으면 호출한 쪽에서 기본 이미지를 쓰도록 null 을 돌려준다.
 */
export const mediaUrl = (path?: string | null): string | null => {
  if (!path) return null;
  /* 이미 절대 URL 이면 그대로 쓴다 */
  if (/^https?:\/\//.test(path)) return path;
  return `${baseURL}/${path.replace(/^\//, "")}`;
};
