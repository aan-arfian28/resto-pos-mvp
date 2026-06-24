import { api } from "./api";
import type { User } from "@/types";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user_id: string;
  username: string;
  role: User["role"];
  full_name: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<{ token: string; user: User }> => {
    const response = await api.post<LoginResponse>("/auth/login", credentials, {
      skipAuth: true,
    });

    // Backend returns flat fields; build the User object
    const user: User = {
      id: response.user_id,
      username: response.username,
      role: response.role,
      full_name: response.full_name,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("bf_token", response.token);
      localStorage.setItem("bf_user", JSON.stringify(user));
    }

    return { token: response.token, user };
  },

  getProfile: async (): Promise<User> => {
    return api.get<User>("/auth/profile");
  },

  logout: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bf_token");
      localStorage.removeItem("bf_user");
    }
  },

  getStoredUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("bf_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  },

  getStoredToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("bf_token");
  },
};
