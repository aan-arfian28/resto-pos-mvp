export interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
  created_at?: string;
  parent?: Category | null;
  children?: Category[];
}

export interface MenuItem {
  id: string;
  category_id?: string | null;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  delivery_markup_percent: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category | null;
}
