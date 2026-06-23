"use client";

import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
}: SwitchProps) {
  const sizeClasses = size === "sm" ? "w-8 h-4" : "w-11 h-6";
  const dotSize = size === "sm" ? "w-3 h-3" : "w-5 h-5";
  const translateClass = size === "sm" ? "translate-x-4" : "translate-x-5";

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex ${sizeClasses} shrink-0 rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
          dark:focus:ring-offset-dark-800
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${checked ? "bg-brand-600 dark:bg-brand-500" : "bg-gray-300 dark:bg-dark-600"}
        `}
      >
        <span
          className={`
            inline-block ${dotSize} rounded-full bg-white shadow-sm
            transform transition-transform duration-200 ease-in-out
            ${checked ? translateClass : "translate-x-0.5"}
            ${size === "sm" ? "mt-0.5 ml-0.5" : "m-0.5"}
          `}
        />
      </button>
      {label && (
        <span className="text-sm text-gray-700 dark:text-dark-200 select-none">
          {label}
        </span>
      )}
    </label>
  );
}
