/*
 * 股票追蹤表 Service Worker
 * - 頁面與圖示：優先抓網路最新版，沒網路時用快取（GitHub 更新後重開 App 就會套用新版）
 * - 圖表與字型程式庫：快取優先，離線也能開啟
 * - 試算表資料（Google / Apps Script）：一律不快取，永遠讀最新資料
 * 修改本檔後把 VERSION 加一，舊快取會自動清除。
 */
const VERSION = 'v1';
const CACHE = 'stock-tracker-' + VERSION;
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.png'];
const NEVER_CACHE = /(^|\.)(script\.google\.com|script\.googleusercontent\.com|docs\.google\.com)$/;
const LIBS = /^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('stock-tracker-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (NEVER_CACHE.test(url.hostname)) return;              // 資料請求直接走網路

  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
      event.respondWith(networkFirst(req));                // 頁面：網路優先
    } else {
      event.respondWith(cacheFirst(req));                  // 圖示、manifest
    }
    return;
  }
  if (LIBS.test(url.hostname)) event.respondWith(cacheFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(req)) || (await cache.match('./index.html')) || Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return Response.error();
  }
}
