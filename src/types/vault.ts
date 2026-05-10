export interface VaultCategory {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface VaultEntry {
  id: string;
  productName: string;
  password?: string;
  url?: string;
  note?: string;
}

export interface VaultItem {
  id: string;
  user_id: string;
  category_id: string | null;
  item_type: string; // 'Password' | 'Link' | 'Note' | 'API Key' | 'General'
  title: string; // Used as the Label / Client Name
  username?: string; // Legacy
  password?: string; // Legacy
  url?: string; // Legacy
  notes?: string; // General note
  entries: VaultEntry[]; // New multiple dynamic entries
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
