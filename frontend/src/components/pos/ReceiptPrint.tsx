"use client";

import React from "react";
import { formatCurrency } from "@/lib/formatCurrency";

interface ReceiptPrintProps {
  orderId: string;
  items: { name: string; qty: number; price: number; notes?: string }[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: string;
  amountReceived?: number;
  changeAmount?: number;
  tableNumber?: string;
  orderType: string;
  taxEnabled: boolean;
  taxRate: number;
  cashierName?: string;
}

export function ReceiptPrint({
  orderId, items, subtotal, taxAmount, grandTotal,
  paymentMethod, amountReceived, changeAmount,
  tableNumber, orderType, taxEnabled, taxRate, cashierName,
}: ReceiptPrintProps) {
  return (
    <div className="print-receipt hidden print:block p-4 font-mono text-xs" style={{ width: "80mm" }}>
      <div className="text-center mb-2">
        <p className="font-bold text-sm">BISTROFLOW POS</p>
        <p className="text-[10px] text-gray-500">{new Date().toLocaleString("id-ID")}</p>
        {cashierName && <p className="text-[10px]">Kasir: {cashierName}</p>}
      </div>
      <hr className="border-dashed mb-2" />
      <p className="text-[10px] mb-1">Order: {orderId.slice(0, 8)}</p>
      <p className="text-[10px] mb-1 capitalize">Tipe: {orderType.replace("_", " ")}</p>
      {tableNumber && <p className="text-[10px] mb-1">Meja: {tableNumber}</p>}
      <hr className="border-dashed mb-2" />
      <div className="mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-[10px] mb-0.5">
            <span>{item.name} x{item.qty}</span>
            <span>{formatCurrency(item.price * item.qty)}</span>
          </div>
        ))}
      </div>
      <hr className="border-dashed mb-2" />
      <div className="text-[10px]">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        {taxEnabled && <div className="flex justify-between"><span>PPN {taxRate}%</span><span>{formatCurrency(taxAmount)}</span></div>}
        <div className="flex justify-between font-bold"><span>TOTAL</span><span>{formatCurrency(grandTotal)}</span></div>
      </div>
      <hr className="border-dashed my-2" />
      <div className="text-[10px]">
        <p className="capitalize">Bayar: {paymentMethod}</p>
        {amountReceived && <p>Tunai: {formatCurrency(amountReceived)}</p>}
        {changeAmount !== undefined && changeAmount > 0 && <p className="font-bold">Kembali: {formatCurrency(changeAmount)}</p>}
      </div>
      <hr className="border-dashed my-2" />
      <p className="text-center text-[10px] text-gray-500">Terima kasih!</p>
    </div>
  );
}

export function ZReportPrint({
  shiftId, userName, startTime, endTime, modalAwal,
  totalTunai, totalVoid, saldoAkhir, saldoAktual, selisih,
}: {
  shiftId: string; userName: string; startTime: string; endTime: string;
  modalAwal: number; totalTunai: number; totalVoid: number;
  saldoAkhir: number; saldoAktual?: number; selisih?: number;
}) {
  return (
    <div className="print-receipt hidden print:block p-4 font-mono text-xs" style={{ width: "80mm" }}>
      <div className="text-center mb-2">
        <p className="font-bold text-sm">BISTROFLOW — Z-Report</p>
        <p className="text-[10px]">Shift: {shiftId.slice(0, 8)}</p>
        <p className="text-[10px]">Kasir: {userName}</p>
        <p className="text-[10px]">{startTime} — {endTime}</p>
      </div>
      <hr className="border-dashed mb-2" />
      <div className="text-[10px] space-y-1">
        <div className="flex justify-between"><span>Modal Awal</span><span>{formatCurrency(modalAwal)}</span></div>
        <div className="flex justify-between"><span>Total Penjualan Tunai</span><span>{formatCurrency(totalTunai)}</span></div>
        <div className="flex justify-between"><span>Total Void</span><span>{formatCurrency(totalVoid)}</span></div>
        <div className="flex justify-between font-bold"><span>Saldo Akhir</span><span>{formatCurrency(saldoAkhir)}</span></div>
        {saldoAktual !== undefined && <div className="flex justify-between"><span>Saldo Aktual</span><span>{formatCurrency(saldoAktual)}</span></div>}
        {selisih !== undefined && <div className="flex justify-between"><span>Selisih</span><span>{formatCurrency(selisih)}</span></div>}
      </div>
      <hr className="border-dashed my-2" />
      <p className="text-center text-[10px]">—— Akhir Z-Report ——</p>
    </div>
  );
}

export function triggerPrint() {
  window.print();
}
