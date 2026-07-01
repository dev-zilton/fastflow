const CACHE_NAME = 'fastflow-v1'
const RUNTIME_CACHE = 'fastflow-runtime-v1'
const API_CACHE = 'fastflow-api-v1'

const STATIC_ASSETS = [
  '/',
  '/restaurants',
  '/about',
  '/offline',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS.map((url) => new Request(url, { cache: 'reload' })))
      })
      .catch(() => {
        console.log('[SW] Initial cache may have failed, will cache on first request')
      })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // API requests - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, response.clone())
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return (
              cached ||
              new Response(
                JSON.stringify({ error: 'Offline - cached data may be stale' }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              )
            )
          })
        })
    )
    return
  }

  // HTML pages - cache first for offline support
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches
        .match(request)
        .then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.ok) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, response.clone())
              })
            }
            return response
          })
          return cached || fetchPromise
        })
        .catch(() => {
          return caches.match(request)
        })
    )
    return
  }

  // Assets (JS, CSS, images) - cache first
  event.respondWith(
    caches
      .match(request)
      .then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, response.clone())
              })
            }
            return response
          })
        )
      })
      .catch(() => {
        // Return a placeholder for failed assets
        if (request.headers.get('accept')?.includes('image')) {
          return new Response(
            '<svg><rect fill="#ccc" width="200" height="200"/></svg>',
            {
              headers: { 'Content-Type': 'image/svg+xml' },
            }
          )
        }
      })
  )
})

// Background sync for queued orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('[SW] Syncing orders...')
    event.waitUntil(syncOrders())
  }
})

async function syncOrders() {
  try {
    const db = await openIndexedDB()
    const pendingOrders = await getPendingOrders(db)

    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        })

        if (response.ok) {
          await markOrderSynced(db, order.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync order:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Sync error:', error)
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FastFlowDB', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id' })
      }
    }
  })
}

function getPendingOrders(db) {
  return new Promise((resolve, reject) => {
    const request = db.transaction('orders').objectStore('orders').getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function markOrderSynced(db, orderId) {
  return new Promise((resolve, reject) => {
    const request = db.transaction('orders', 'readwrite').objectStore('orders').delete(orderId)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
