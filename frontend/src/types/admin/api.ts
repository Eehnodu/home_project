export interface MenuItem {
  id: number;
  label: string;
  uri: string;
  is_active: boolean;
}

export interface ServiceConfigRes {
  id: number;
  name: string;
  is_active: boolean;
  items: MenuItem[];
}

export interface MenuUpdateReq {
  id: number;
  is_active: boolean;
}

export interface MenuCreateReq {
  label: string;
  uri: string;
  is_active: boolean;
}

export interface ServiceToggleReq {
  is_active: boolean;
}
