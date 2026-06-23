"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

const variantBorderStyles = {
  default: "border-l-brand-500",
  success: "border-l-green-500",
  warning: "border-l-yellow-500",
  danger: "border-l-red-500",
};

export function MetricCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  variant = "default",
}: MetricCardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700
        border-l-4 ${variantBorderStyles[variant]}
        shadow-sm p-4 md:p-5
        hover:shadow-md transition-shadow duration-200
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-50 mt-1 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="shrink-0 p-2.5 rounded-lg bg-gray-50 dark:bg-dark-700 text-brand-600 dark:text-brand-400">
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-3">
          {trend.isPositive ? (
            <TrendingUp size={16} className="text-green-500" />
          ) : (
            <TrendingDown size={16} className="text-red-500" />
          )}
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.value}%
          </span>
          <span className="text-xs text-gray-500 dark:text-dark-400">
            vs bulan lalu
          </span>
        </div>
      )}
    </div>
  );
}
