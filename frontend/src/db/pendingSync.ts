import { getDB, PendingSyncOrder, getStorageEstimate } from './schema';

const MAX_RETRIES = 5;
const MAX_BACKOFF_MS = 16000; // 16 seconds

export async function savePendingOrder(orderData: any): Promise<string> {
  const db = await getDB();
  const id = orderData.id || crypto.randomUUID();

  // Check storage quota
  const { usage, quota } = await getStorageEstimate();
  if (quota > 0 && usage / quota > 0.95) {
    throw new Error('Storage penuh. Harap bersihkan data transaksi lama yang sudah tersinkron.');
  }

  if (usage / quota > 0.8) {
    console.warn('IndexedDB usage above 80%');
  }

  const pendingOrder: PendingSyncOrder = {
    id,
    data: orderData,
    synced: false,
    original_timestamp: orderData.original_timestamp || new Date().toISOString(),
    created_at: new Date().toISOString(),
    retry_count: 0,
    conflict: false,
  };

  await db.put('pending_sync', pendingOrder);
  return id;
}

export async function getPendingOrders(): Promise<PendingSyncOrder[]> {
  const db = await getDB();
  const orders = await db.getAllFromIndex('pending_sync', 'by-synced', false);
  return orders.sort((a, b) =>
    a.original_timestamp.localeCompare(b.original_timestamp)
  );
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  return await db.countFromIndex('pending_sync', 'by-synced', false);
}

export async function markAsSynced(id: string): Promise<void> {
  const db = await getDB();
  const order = await db.get('pending_sync', id);
  if (order) {
    order.synced = true;
    await db.put('pending_sync', order);
  }
}

export async function markAsConflict(id: string, error: string): Promise<void> {
  const db = await getDB();
  const order = await db.get('pending_sync', id);
  if (order) {
    order.conflict = true;
    order.data._conflict_error = error;
    await db.put('pending_sync', order);
  }
}

export async function incrementRetry(id: string): Promise<boolean> {
  const db = await getDB();
  const order = await db.get('pending_sync', id);
  if (order) {
    order.retry_count++;
    await db.put('pending_sync', order);
    return order.retry_count < MAX_RETRIES;
  }
  return false;
}

export async function removeSyncedOrder(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pending_sync', id);
}

export async function cleanupOldSynced(daysOld: number = 7): Promise<number> {
  const db = await getDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  const allOrders = await db.getAll('pending_sync');
  let cleaned = 0;

  for (const order of allOrders) {
    if (order.synced && new Date(order.created_at) < cutoff) {
      await db.delete('pending_sync', order.id);
      cleaned++;
    }
  }

  return cleaned;
}

export function calculateBackoff(retryCount: number): number {
  const delay = Math.min(1000 * Math.pow(2, retryCount), MAX_BACKOFF_MS);
  return delay + Math.random() * 1000;
}
