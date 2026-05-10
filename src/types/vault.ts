export interface VaultCategory {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface VaultItem {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
