/* 深宫浮生录 - Service Worker：离线缓存（HTML 网络优先，静态资源缓存优先） */
const CACHE = 'shengong-v3';
const CORE = [
  './',
  './index.html',
  './street.html',
  './manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  // 封面关键资源：预缓存保证首屏与离线立即出封面
  'fm.webp',
  'start.png',
  'save.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isHtml = req.mode === 'navigate' || url.pathname === '/' || /\.html?$/.test(url.pathname);
  if (isHtml) {
    // HTML/导航：网络优先，保证拿到最新版本；失败回退缓存（离线可用）
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }
  // 静态资源：缓存优先，离线可用
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          if (new URL(req.url).origin === self.location.origin && res.ok) {
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
