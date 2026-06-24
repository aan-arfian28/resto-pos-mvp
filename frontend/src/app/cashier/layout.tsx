"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("bf_token");
    const storedUser = localStorage.getItem("bf_user");

    if (!token || token === "undefined" || !storedUser || storedUser === "undefined") {
      localStorage.removeItem("bf_token");
      localStorage.removeItem("bf_user");
      window.location.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (!user?.role) throw new Error("bad user");
      useAuthStore.setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("bf_token");
      localStorage.removeItem("bf_user");
      window.location.replace("/login");
    }
  }, []);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <OfflineBanner />
      {children}
    </div>
  );
}
