/* Service Worker — https/localhost配信時のみ有効（file://では未登録） */
const CACHE = "jikanwari-v5-20260524";
const ASSETS = ["./manifest.json", "./icon.svg", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./units.js", "./events.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => k !== CACHE && caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; // CDN(SheetJS)等はSW介入せずネット直

  if (e.request.mode === "navigate" || e.request.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy));
          return resp;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(() => caches.match("./index.html")))
  );
});
