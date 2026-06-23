import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface PendingSyncOrder {
  id: string;
  data: any;
  synced: boolean;
  original_timestamp: string;
  created_at: string;
  retry_count: number;
  conflict: boolean;
}

export interface CachedMenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  base_price: number;
  image_url: string;
  delivery_markup_percent: number;
  is_available: boolean;
  updated_at: string;
}

export interface CachedSetting {
  key: string;
  value: string;
}

export interface HeldBill {
  id: string;
  items: any[];
  order_mode: string;
  table_number: string;
  created_at: string;
  subtotal: number;
  tax_amount: number;
  grand_total: number;
}

export interface CachedShift {
  id: string;
  user_id: string;
  modal_awal: number;
  status: 'open' | 'closed';
  start_time: string;
}

export interface BistroFlowDB extends DBSchema {
  pending_sync: {
    key: string;
    value: PendingSyncOrder;
    indexes: {
      'by-synced': boolean;
      'by-timestamp': string;
    };
  };
  menu_cache: {
    key: string;
    value: CachedMenuItem;
    indexes: {
      'by-category': string;
      'by-updated': string;
    };
  };
  settings_cache: {
    key: string;
    value: CachedSetting;
  };
  held_bills: {
    key: string;
    value: HeldBill;
    indexes: {
      'by-created': string;
    };
  };
  shift_cache: {
    key: string;
    value: CachedShift;
  };
}

const DB_NAME = 'bistroflow-pos';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<BistroFlowDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BistroFlowDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BistroFlowDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Pending sync store
      if (!db.objectStoreNames.contains('pending_sync')) {
        const store = db.createObjectStore('pending_sync', { keyPath: 'id' });
        store.createIndex('by-synced', 'synced');
        store.createIndex('by-timestamp', 'original_timestamp');
      }

      // Menu cache store
      if (!db.objectStoreNames.contains('menu_cache')) {
        const store = db.createObjectStore('menu_cache', { keyPath: 'id' });
        store.createIndex('by-category', 'category_id');
        store.createIndex('by-updated', 'updated_at');
      }

      // Settings cache store
      if (!db.objectStoreNames.contains('settings_cache')) {
        db.createObjectStore('settings_cache', { keyPath: 'key' });
      }

      // Held bills store
      if (!db.objectStoreNames.contains('held_bills')) {
        const store = db.createObjectStore('held_bills', { keyPath: 'id' });
        store.createIndex('by-created', 'created_at');
      }

      // Shift cache store
      if (!db.objectStoreNames.contains('shift_cache')) {
        db.createObjectStore('shift_cache', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

export async function clearDatabase(): Promise<void> {
  const db = await getDB();
  const stores = ['pending_sync', 'menu_cache', 'settings_cache', 'held_bills', 'shift_cache'];
  for (const store of stores) {
    await db.clear(store);
  }
}

export async function getStorageEstimate(): Promise<{ usage: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return { usage: 0, quota: 0 };
}
