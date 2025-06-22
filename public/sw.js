// Service Worker para Verde Raíz v3.0
const CACHE_NAME = "verde-raiz-v3-cache"
const urlsToCache = ["/", "/manifest.json"]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

// Interceptar requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devolver desde cache si existe, sino fetch de la red
      return response || fetch(event.request)
    }),
  )
})

// Programar reporte automático
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_DAILY_REPORT") {
    scheduleDailyReport()
  }
})

function scheduleDailyReport() {
  // Calcular tiempo hasta las 21:00
  const now = new Date()
  const target = new Date()
  target.setHours(21, 0, 0, 0)

  // Si ya pasaron las 21:00, programar para mañana
  if (now > target) {
    target.setDate(target.getDate() + 1)
  }

  const timeUntilReport = target.getTime() - now.getTime()

  setTimeout(() => {
    // Enviar notificación para generar reporte
    self.registration.showNotification("Verde Raíz - Reporte Diario", {
      body: "Es hora de generar el reporte diario automático",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: "daily-report",
      requireInteraction: true,
      actions: [
        {
          action: "generate-report",
          title: "Generar Reporte",
        },
        {
          action: "dismiss",
          title: "Más Tarde",
        },
      ],
    })

    // Programar para el día siguiente
    scheduleDailyReport()
  }, timeUntilReport)
}

// Manejar clicks en notificaciones
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "generate-report") {
    // Abrir la app en la pestaña de reportes
    event.waitUntil(clients.openWindow("/?tab=reportes"))
  }
})
