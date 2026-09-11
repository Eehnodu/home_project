// user_info 토큰 타입
export interface UserInfo {
  auth_type: string;
  id: number;
  user_name: string;
  created_at: string;
}

// /me 호출 시 넘어오는 데이터
export interface UserDetail extends UserInfo {
  user_email: string;
  user_profile_image: string;
  last_login_at: string;
}
