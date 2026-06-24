"use client";

import { create } from "zustand";

interface SettingsState {
  ppnEnabled: boolean;
  taxRate: number;
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;
  tokenEnabled: boolean;
  printerEnabled: boolean;
  autoPrint: boolean;

  setPpnEnabled: (enabled: boolean) => void;
  setTaxRate: (rate: number) => void;
  setServiceChargeEnabled: (enabled: boolean) => void;
  setServiceChargeRate: (rate: number) => void;
  setTokenEnabled: (enabled: boolean) => void;
  setPrinterEnabled: (enabled: boolean) => void;
  setAutoPrint: (enabled: boolean) => void;
  loadSettings: () => void;
  saveSettings: () => void;
}

const SETTINGS_KEY = "bf_settings";

interface StoredSettings {
  ppnEnabled: boolean;
  taxRate: number;
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;
  tokenEnabled: boolean;
  printerEnabled: boolean;
  autoPrint: boolean;
}

function getDefaultSettings(): StoredSettings {
  return {
    ppnEnabled: true,
    taxRate: 0.11,
    serviceChargeEnabled: true,
    serviceChargeRate: 0.05,
    tokenEnabled: true,
    printerEnabled: false,
    autoPrint: false,
  };
}

function loadStoredSettings(): StoredSettings {
  if (typeof window === "undefined") return getDefaultSettings();
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...getDefaultSettings(), ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return getDefaultSettings();
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadStoredSettings(),

  setPpnEnabled: (enabled) => {
    set({ ppnEnabled: enabled });
    get().saveSettings();
  },

  setTaxRate: (rate) => {
    set({ taxRate: rate });
    get().saveSettings();
  },

  setServiceChargeEnabled: (enabled) => {
    set({ serviceChargeEnabled: enabled });
    get().saveSettings();
  },

  setServiceChargeRate: (rate) => {
    set({ serviceChargeRate: rate });
    get().saveSettings();
  },

  setTokenEnabled: (enabled) => {
    set({ tokenEnabled: enabled });
    get().saveSettings();
  },

  setPrinterEnabled: (enabled) => {
    set({ printerEnabled: enabled });
    get().saveSettings();
  },

  setAutoPrint: (enabled) => {
    set({ autoPrint: enabled });
    get().saveSettings();
  },

  loadSettings: () => {
    const stored = loadStoredSettings();
    set(stored);
  },

  saveSettings: () => {
    if (typeof window === "undefined") return;
    const { ppnEnabled, taxRate, serviceChargeEnabled, serviceChargeRate, tokenEnabled, printerEnabled, autoPrint } = get();
    const toStore: StoredSettings = {
      ppnEnabled,
      taxRate,
      serviceChargeEnabled,
      serviceChargeRate,
      tokenEnabled,
      printerEnabled,
      autoPrint,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toStore));
  },
}));
