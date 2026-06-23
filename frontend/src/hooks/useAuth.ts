"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types";

export function useAuth(requiredRoles?: UserRole[]) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth, hasRole } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const authorized = isAuthenticated && (!requiredRoles || hasRole(...requiredRoles));

  return {
    user,
    isAuthenticated,
    isLoading,
    authorized,
    hasRole,
  };
}
