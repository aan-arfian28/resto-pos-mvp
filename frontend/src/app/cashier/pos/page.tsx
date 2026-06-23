"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  Clock,
  User,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { usePosStore } from "@/stores/posStore";
import { useShiftStore } from "@/stores/shiftStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { MenuGrid } from "@/components/pos/MenuGrid";
import { CartPanel } from "@/components/pos/CartPanel";
import { OrderModeSelector } from "@/components/pos/OrderModeSelector";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { BillHoldList } from "@/components/pos/BillHoldList";
import { OpenShiftDialog, EndShiftDialog } from "@/components/pos/ShiftDialog";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatTime } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

export default function PosPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { clearCart, items, grandTotal } = useCartStore();
  const {
    orderMode,
    isShiftOpen,
    activeView,
    heldBills,
    setActiveView,
    addHeldBill,
    removeHeldBill,
    resetOrder,
  } = usePosStore();
  const { currentShift, openShift, endShift } = useShiftStore();
  const { ppnEnabled } = useSettingsStore();

  const [showPayment, setShowPayment] = useState(false);
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Open shift check
  React.useEffect(() => {
    if (!currentShift && !isShiftOpen) {
      setShowOpenShift(true);
    }
  }, [currentShift, isShiftOpen]);

  const handleOpenShift = async (openingBalance: number, notes?: string) => {
    try {
      await openShift(openingBalance, notes);
      setShowOpenShift(false);
    } catch {
      // Error handled by store
    }
  };

  const handleEndShift = async (closingBalance: number, notes?: string) => {
    try {
      await endShift(closingBalance, notes);
      setShowEndShift(false);
    } catch {
      // Error handled by store
    }
  };

  const handlePay = () => {
    if (items.filter((i) => !i.isVoided).length === 0) return;
    setShowPayment(true);
  };

  const handlePaymentComplete = (
    method: PaymentMethod,
    amount: number,
    change: number
  ) => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      useCartStore.getState().setPayment(method, amount, change);
      useCartStore.getState().markAsPaid();
      setShowPayment(false);
      setIsProcessing(false);

      // Clear cart and reset
      setTimeout(() => {
        clearCart();
        resetOrder();
      }, 2000);
    }, 1000);
  };

  const handleHold = () => {
    const activeItems = items.filter((i) => !i.isVoided);
    if (activeItems.length === 0) return;

    const bill = {
      id: `hold-${Date.now()}`,
      orderNumber: `H${String(heldBills.length + 1).padStart(3, "0")}`,
      itemCount: activeItems.reduce((sum, i) => sum + i.quantity, 0),
      total: grandTotal,
      heldAt: new Date().toISOString(),
    };

    addHeldBill(bill);
    clearCart();
    resetOrder();
  };

  const handleResumeBill = (billId: string) => {
    removeHeldBill(billId);
    setActiveView("menu");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-dark-900">
      {/* Minimal Header */}
      <header className="shrink-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900 dark:text-dark-50">
              BistroFlow POS
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-dark-400">
              <Clock size={14} />
              <span id="current-time">{formatTime(new Date())}</span>
            </div>
            {currentShift && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Shift #{currentShift.id.slice(0, 6)}</span>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <OrderModeSelector />

            <div className="w-px h-6 bg-gray-200 dark:bg-dark-700 mx-1" />

            {/* Owner Dashboard Link */}
            {user?.role === "owner" && (
              <button
                onClick={() => router.push("/owner/dashboard")}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                title="Dashboard Owner"
              >
                <LayoutDashboard size={18} />
              </button>
            )}

            {/* End Shift */}
            {currentShift && (
              <button
                onClick={() => setShowEndShift(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                Tutup Shift
              </button>
            )}

            {/* User Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-dark-700">
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <span className="hidden lg:inline text-sm text-gray-700 dark:text-dark-200">
                {user?.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menu Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          {activeView === "hold" ? (
            <BillHoldList onResume={handleResumeBill} />
          ) : (
            <MenuGrid />
          )}
        </div>

        {/* Cart Panel */}
        <div className="w-full max-w-sm hidden lg:flex flex-col">
          <CartPanel onPay={handlePay} onHold={handleHold} />
        </div>
      </div>

      {/* Mobile Cart Bar */}
      <div className="lg:hidden shrink-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-dark-400">
              {items.filter((i) => !i.isVoided).length} item
            </p>
            <p className="text-lg font-bold text-brand-600">
              {formatCurrency(grandTotal)}
            </p>
          </div>
          <button
            onClick={handlePay}
            disabled={items.filter((i) => !i.isVoided).length === 0}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Bayar
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Shift Dialogs */}
      <OpenShiftDialog
        isOpen={showOpenShift}
        onClose={() => setShowOpenShift(false)}
        onConfirm={handleOpenShift}
      />

      {currentShift && (
        <EndShiftDialog
          isOpen={showEndShift}
          onClose={() => setShowEndShift(false)}
          onConfirm={handleEndShift}
          totalSales={grandTotal}
          totalOrders={items.filter((i) => !i.isVoided).length}
          openingBalance={currentShift.openingBalance || 0}
        />
      )}
    </div>
  );
}
