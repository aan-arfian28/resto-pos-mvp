"use client";

import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[60] px-4 py-2 text-center text-sm font-medium
        transition-all duration-300
        ${
          isOnline
            ? "bg-green-500 text-white"
            : "bg-yellow-500 text-yellow-900"
        }
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {!isOnline && <WifiOff size={16} />}
        <span>
          {isOnline
            ? "Koneksi kembali - Data akan disinkronkan"
            : "Anda sedang offline - Data akan disimpan secara lokal"}
        </span>
      </div>
    </div>
  );
}
