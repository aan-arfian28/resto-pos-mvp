// ── Workbox precache manifest placeholder (next-pwa injects build-time assets here) ──
self.__WB_MANIFEST = [];

// ── Cache names ──
const CACHE_NAME = "bistroflow-v1";
const IMAGE_CACHE = "bistroflow-images-v1";
const OFFLINE_URL = "/login";

const STATIC_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
];

// ── Install: pre-cache static assets ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== IMAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategies ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for API calls — never cache
  if (url.pathname.includes("/api/")) {
    event.respondWith(networkOnly(request));
    return;
  }

  // Cache-first for images
  if (request.destination === "image" || /\.(png|jpg|jpeg|gif|webp|avif|svg)(\?.*)?$/i.test(url.pathname)) {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  // Network-first for HTML navigations — never serve stale auth-protected pages
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Stale-while-revalidate for JS / CSS / fonts
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    /\.(js|css|woff2?|ttf|otf)(\?.*)?$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

// ── Background sync on 'online' event ──
self.addEventListener("online", () => {
  console.log("[SW] Back online — registering background sync");
  self.registration.sync
    .register("sync-pending-orders")
    .catch((err) => console.warn("[SW] Sync registration failed:", err));
});

// ── Sync event handler ──
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-pending-orders") {
    event.waitUntil(syncPendingOrders());
  }
});

// ── Periodic sync (when supported by browser) ──
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "sync-pending-orders") {
    event.waitUntil(syncPendingOrders());
  }
});

// ── Caching strategies ──

/** Network-first for HTML navigations — fall back to cache only when offline. */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match(OFFLINE_URL);
  }
}

/** Network-only for API — return offline JSON on failure. */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(
      JSON.stringify({ status: "error", message: "Anda sedang offline" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

/** Cache-first for images — fetch network only when missing, then cache. */
async function cacheFirstImage(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const clone = response.clone();
      caches.open(IMAGE_CACHE).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    // Return a transparent 1x1 pixel SVG as fallback
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
      { status: 200, headers: { "Content-Type": "image/svg+xml" } }
    );
  }
}

/** Stale-while-revalidate — serve cached, update in background. */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// ── Background sync: process queued offline orders ──
async function syncPendingOrders() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction("pending_sync", "readonly");
    const store = tx.objectStore("pending_sync");
    const pending = await store.index("by-synced").getAll(false);

    for (const order of pending.sort((a, b) =>
      a.original_timestamp.localeCompare(b.original_timestamp)
    )) {
      try {
        const resp = await fetch("/api/v1/orders/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([order.data]),
        });
        if (resp.ok) {
          const writeTx = db.transaction("pending_sync", "readwrite");
          await writeTx.store.delete(order.id);
          await writeTx.done;
        }
      } catch {
        break; // Will retry on next sync event
      }
    }
  } catch (err) {
    console.error("[SW] Background sync failed:", err);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("bistroflow-pos", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("pending_sync")) {
        const store = db.createObjectStore("pending_sync", { keyPath: "id" });
        store.createIndex("by-synced", "synced");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
