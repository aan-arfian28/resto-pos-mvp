"use client";

import React from "react";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 2 | 3 | 4;
}

const colStyles = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export function BentoGrid({ children, className = "", cols = 4 }: BentoGridProps) {
  return (
    <div className={`grid ${colStyles[cols]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}

const colSpanStyles = {
  1: "",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
};

const rowSpanStyles = {
  1: "",
  2: "row-span-2",
};

export function BentoItem({
  children,
  className = "",
  colSpan = 1,
  rowSpan = 1,
}: BentoItemProps) {
  return (
    <div
      className={`
        bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700
        shadow-sm p-4 md:p-6
        ${colSpanStyles[colSpan]}
        ${rowSpanStyles[rowSpan]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
