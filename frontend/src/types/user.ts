export type UserRole = "owner" | "cashier";

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
