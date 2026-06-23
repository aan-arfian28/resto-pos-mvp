import { api } from "./api";
import type { User } from "@/types";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", credentials, {
      skipAuth: true,
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("bf_token", response.token);
      localStorage.setItem("bf_user", JSON.stringify(response.user));
    }

    return response;
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
