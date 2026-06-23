"use client";

import React from "react";
import { Calendar } from "lucide-react";

export type PeriodPreset = "today" | "yesterday" | "this-week" | "this-month" | "last-month" | "custom";

interface PeriodSelectorProps {
  value: PeriodPreset;
  onChange: (preset: PeriodPreset) => void;
  startDate?: string;
  endDate?: string;
  onDateChange?: (start: string, end: string) => void;
}

const presets: { value: PeriodPreset; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "yesterday", label: "Kemarin" },
  { value: "this-week", label: "Minggu Ini" },
  { value: "this-month", label: "Bulan Ini" },
  { value: "last-month", label: "Bulan Lalu" },
  { value: "custom", label: "Kustom" },
];

export function PeriodSelector({
  value,
  onChange,
  startDate,
  endDate,
  onDateChange,
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
            ${
              value === preset.value
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600"
            }
          `}
        >
          {preset.label}
        </button>
      ))}

      {value === "custom" && onDateChange && (
        <div className="flex items-center gap-2 ml-2">
          <div className="relative">
            <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => onDateChange(e.target.value, endDate || "")}
              className="pl-8 pr-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative">
            <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => onDateChange(startDate || "", e.target.value)}
              className="pl-8 pr-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
