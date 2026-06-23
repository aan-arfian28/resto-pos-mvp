export type SpiceLevel = 0 | 1 | 2 | 3;

export interface MenuItemOption {
  id: string;
  name: string;
  type: "spice" | "notes" | "choice";
  choices?: string[];
  required: boolean;
  priceAdjustment?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  category?: MenuCategory;
  image?: string;
  isAvailable: boolean;
  isFavorite: boolean;
  spiceLevel?: SpiceLevel;
  options?: MenuItemOption[];
  preparationTime?: number;
  estimatedMinutes?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
