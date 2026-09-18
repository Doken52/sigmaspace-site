/* Sigma Space: минимальный service worker.
   Кэширует только статику этого же origin (js/css/шрифты/картинки из сборки) —
   повторные визиты открываются мгновенно, даже при плохой связи.
   API (Supabase), Telegram и оплаты проходят напрямую — их не трогаем. */
const CACHE = 'sigmaspace-v1'
const STATIC = /\.(?:js|css|woff2?|png|jpe?g|webp|svg|ico)$/

self.addEventListener('install', () => { self.skipWaiting() })

self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()) })

self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (!STATIC.test(url.pathname)) return
  e.respondWith((async () => {
    const hit = await caches.match(req)
    if (hit) return hit
    try {
      const res = await fetch(req)
      if (res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()).catch(() => {}) }
      return res
    } catch { return Response.error() }
  })())
})
