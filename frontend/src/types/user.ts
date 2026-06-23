export type UserRole = "owner" | "cashier" | "kitchen" | "admin";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
