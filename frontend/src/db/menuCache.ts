import { getDB, CachedMenuItem, CachedSetting, CachedShift, HeldBill } from './schema';

// Menu Cache
export async function cacheMenuItems(items: CachedMenuItem[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('menu_cache', 'readwrite');
  await Promise.all([
    ...items.map(item => tx.store.put(item)),
    tx.done,
  ]);
}

export async function getCachedMenuItems(): Promise<CachedMenuItem[]> {
  const db = await getDB();
  return await db.getAll('menu_cache');
}

export async function getCachedMenuByCategory(categoryId: string): Promise<CachedMenuItem[]> {
  const db = await getDB();
  return await db.getAllFromIndex('menu_cache', 'by-category', categoryId);
}

export async function clearMenuCache(): Promise<void> {
  const db = await getDB();
  await db.clear('menu_cache');
}

// Settings Cache
export async function cacheSettings(settings: Record<string, string>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('settings_cache', 'readwrite');
  for (const [key, value] of Object.entries(settings)) {
    await tx.store.put({ key, value });
  }
  await tx.done;
}

export async function getCachedSettings(): Promise<Record<string, string>> {
  const db = await getDB();
  const all = await db.getAll('settings_cache');
  const settings: Record<string, string> = {};
  for (const s of all) {
    settings[s.key] = s.value;
  }
  return settings;
}

// Shift Cache
export async function cacheShift(shift: CachedShift): Promise<void> {
  const db = await getDB();
  await db.put('shift_cache', shift);
}

export async function getCachedShift(): Promise<CachedShift | undefined> {
  const db = await getDB();
  const all = await db.getAll('shift_cache');
  return all.find(s => s.status === 'open');
}

export async function clearShiftCache(): Promise<void> {
  const db = await getDB();
  await db.clear('shift_cache');
}

// Held Bills
export async function saveHeldBill(bill: HeldBill): Promise<void> {
  const db = await getDB();
  await db.put('held_bills', bill);
}

export async function getHeldBills(): Promise<HeldBill[]> {
  const db = await getDB();
  return await db.getAllFromIndex('held_bills', 'by-created');
}

export async function removeHeldBill(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('held_bills', id);
}

export async function clearHeldBills(): Promise<void> {
  const db = await getDB();
  await db.clear('held_bills');
}
