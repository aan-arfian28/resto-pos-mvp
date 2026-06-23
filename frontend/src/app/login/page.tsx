"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  UtensilsCrossed,
  Sun,
  Moon,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const user = useAuthStore.getState().user;
      if (user?.role === "owner") {
        router.push("/owner/dashboard");
      } else {
        router.push("/cashier/pos");
      }
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    try {
      await login(username.trim(), password);
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900">
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-dark-900">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-8">
            <UtensilsCrossed size={40} />
          </div>
          <h1 className="text-4xl font-bold mb-4">BistroFlow POS</h1>
          <p className="text-lg text-white/70 text-center max-w-md">
            Kelola restoran Anda lebih cerdas dengan sistem POS modern yang
            offline-ready dan mudah digunakan.
          </p>

          <div className="grid grid-cols-2 gap-6 mt-12 w-full max-w-sm">
            {[
              { value: "50rb+", label: "Transaksi" },
              { value: "150+", label: "Restoran" },
              { value: "99.9%", label: "Uptime" },
              { value: "3 detik", label: "Proses" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-600 text-white mb-4">
              <UtensilsCrossed size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-50">
              BistroFlow POS
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
              Masuk ke akun Anda
            </p>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-50">
              Selamat Datang
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
              Masuk untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              autoFocus
              autoComplete="username"
              disabled={isLoading}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                disabled={isLoading}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={!username.trim() || !password.trim()}
              leftIcon={<LogIn size={20} />}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-xs text-center text-gray-400 dark:text-dark-500">
            &copy; {new Date().getFullYear()} BistroFlow POS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Error Toast */}
      <Toast
        type="error"
        title="Login Gagal"
        message={error || undefined}
        isVisible={showError}
        onClose={() => {
          setShowError(false);
          clearError();
        }}
      />
    </div>
  );
}
