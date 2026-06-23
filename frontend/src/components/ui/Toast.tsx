"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} className="text-green-500" />,
  error: <AlertCircle size={20} className="text-red-500" />,
  warning: <AlertTriangle size={20} className="text-yellow-500" />,
  info: <Info size={20} className="text-blue-500" />,
};

const bgMap: Record<ToastType, string> = {
  success: "border-green-200 dark:border-green-800",
  error: "border-red-200 dark:border-red-800",
  warning: "border-yellow-200 dark:border-yellow-800",
  info: "border-blue-200 dark:border-blue-800",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      const timer = setTimeout(() => onRemove(toast.id), duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-dark-800
        border shadow-lg animate-slide-up
        ${bgMap[toast.type]}
      `}
    >
      <div className="shrink-0 mt-0.5">{iconMap[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-dark-50">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-dark-200 dark:hover:bg-dark-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function Toast({
  type = "info",
  title,
  message,
  isVisible,
  onClose,
}: {
  type?: ToastType;
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
}) {
  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-[100] max-w-sm w-full
        flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-dark-800
        border shadow-lg animate-slide-up
        ${bgMap[type]}
      `}
    >
      <div className="shrink-0 mt-0.5">{iconMap[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-dark-50">{title}</p>
        {message && (
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">{message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-dark-200"
      >
        <X size={16} />
      </button>
    </div>
  );
}
