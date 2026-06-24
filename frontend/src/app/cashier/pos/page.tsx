"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  Clock,
  User,
  LayoutDashboard,
  Hash,
  Bike,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { usePosStore } from "@/stores/posStore";
import { useShiftStore } from "@/stores/shiftStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useNotificationStore } from "@/stores/notificationStore";
import { savePendingOrder } from "@/db/pendingSync";
import { orderService } from "@/services/orderService";
import { calculateDeliveryFee, DELIVERY_DISTANCES } from "@/lib/deliveryMarkup";
import { MenuGrid } from "@/components/pos/MenuGrid";
import { CartPanel } from "@/components/pos/CartPanel";
import { OrderModeSelector } from "@/components/pos/OrderModeSelector";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { BillHoldList } from "@/components/pos/BillHoldList";
import { OpenShiftDialog, EndShiftDialog } from "@/components/pos/ShiftDialog";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatTime } from "@/lib/utils";
import type { DeliveryDistance } from "@/lib/deliveryMarkup";

export default function PosPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { clearCart, items, grandTotal, buildOrderPayload } = useCartStore();
  const {
    orderMode,
    tableNumber,
    customerName,
    isShiftOpen,
    activeView,
    heldBills,
    setActiveView,
    setTableNumber,
    addHeldBill,
    removeHeldBill,
    resetOrder,
  } = usePosStore();
  const { currentShift, openShift, endShift, fetchActiveShift } =
    useShiftStore();
  const { ppnEnabled, taxRate, tokenEnabled, loadSettings } = useSettingsStore();
  const { isOnline } = useOnlineStatus();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [showPayment, setShowPayment] = useState(false);
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryDistance, setDeliveryDistance] =
    useState<DeliveryDistance>("medium");

  // Fetch active shift + load settings on mount
  React.useEffect(() => {
    fetchActiveShift();
    loadSettings();
  }, []);

  // Sync settings to cart tax rate
  React.useEffect(() => {
    const rate = ppnEnabled ? taxRate : 0;
    useCartStore.getState().setTaxRate(rate);
  }, [ppnEnabled, taxRate]);

  // Open shift check
  React.useEffect(() => {
    if (!currentShift && !isShiftOpen) {
      setShowOpenShift(true);
    }
  }, [currentShift, isShiftOpen]);

  // Compute delivery fee when mode is delivery
  const deliveryFee =
    orderMode === "delivery" ? calculateDeliveryFee(deliveryDistance) : 0;
  const totalWithDelivery = grandTotal + deliveryFee;

  const handleOpenShift = async (modalAwal: number) => {
    try {
      await openShift(modalAwal);
      setShowOpenShift(false);
    } catch {
      // Error handled by store
    }
  };

  const handleEndShift = async (saldoAktual?: number) => {
    try {
      const report = await endShift(saldoAktual);
      setShowEndShift(false);
    } catch {
      // Error handled by store
    }
  };

  const handlePay = () => {
    if (items.filter((i) => !i.isVoided).length === 0) return;
    setShowPayment(true);
  };

  const handlePaymentComplete = async (
    method: string,
    amount: number,
    change: number
  ) => {
    setIsProcessing(true);

    try {
      // Map UI order mode (dine-in) to API format (dine_in)
      const orderTypeMap: Record<string, string> = {
        "dine-in": "dine_in",
        takeaway: "takeaway",
        delivery: "delivery",
      };
      const apiOrderType: string = orderTypeMap[orderMode] || "dine_in";

      // Set payment state first so buildOrderPayload includes it
      useCartStore.getState().setPayment(method, amount, change);

      // Build API-compatible payload via store method
      const payload = buildOrderPayload(
        currentShift?.id || "",
        apiOrderType,
        tableNumber || null
      );

      if (isOnline) {
        // Online: call API
        await orderService.createOrder(payload as any);
      } else {
        // Offline: save to IndexedDB for later sync
        await savePendingOrder(payload);
        addNotification(
          "info",
          "Transaksi tersimpan lokal – menunggu sinkronisasi"
        );
      }

      setShowPayment(false);
      setIsProcessing(false);

      // Clear cart and reset after a brief pause
      setTimeout(() => {
        clearCart();
        resetOrder();
      }, 2000);
    } catch {
      addNotification("error", "Gagal memproses pembayaran");
      setIsProcessing(false);
    }
  };

  const handleHold = () => {
    const activeItems = items.filter((i) => !i.isVoided);
    if (activeItems.length === 0) return;

    const bill = {
      id: `hold-${Date.now()}`,
      orderNumber: `H${String(heldBills.length + 1).padStart(3, "0")}`,
      itemCount: activeItems.reduce((sum, i) => sum + i.quantity, 0),
      total: totalWithDelivery,
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
      {/* Header */}
      <header className="shrink-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left: title + order mode */}
          <div className="flex items-center gap-5">
            <h1 className="text-lg font-bold text-gray-900 dark:text-dark-50">BistroFlow</h1>
            <OrderModeSelector />
          </div>

          {/* Right: table + shift + user */}
          <div className="flex items-center gap-3">
            {tokenEnabled && orderMode === "dine_in" && (
              <input
                type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}
                placeholder="No. Meja"
                className="w-20 px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}
            {orderMode === "delivery" && (
              <select value={deliveryDistance} onChange={(e) => setDeliveryDistance(e.target.value as DeliveryDistance)}
                className="px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800">
                {DELIVERY_DISTANCES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            )}
            {currentShift?.id && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                #{currentShift.id.slice(0, 6)}
              </span>
            )}
            {currentShift && (
              <button onClick={() => setShowEndShift(true)} className="text-xs font-medium text-red-600 hover:text-red-700">
                Tutup Shift
              </button>
            )}
            <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-500" title="Logout">
              <LogOut size={16} />
            </button>
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
              {formatCurrency(totalWithDelivery)}
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
        total={totalWithDelivery}
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
          totalSales={totalWithDelivery}
          totalOrders={items.filter((i) => !i.isVoided).length}
          openingBalance={currentShift.openingBalance || 0}
        />
      )}
    </div>
  );
}
