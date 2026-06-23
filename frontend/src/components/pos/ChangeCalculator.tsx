"use client";

import React from "react";
import { formatCurrency } from "@/lib/formatCurrency";

interface ChangeCalculatorProps {
  change: number;
}

export function ChangeCalculator({ change }: ChangeCalculatorProps) {
  return (
    <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center animate-fade-in border border-green-200 dark:border-green-800">
      <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
        Kembalian
      </p>
      <p className="text-4xl font-bold text-green-700 dark:text-green-300">
        {formatCurrency(change)}
      </p>
    </div>
  );
}
