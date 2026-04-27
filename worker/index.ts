// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || "JARVIS System", {
      body: data.body || "Ada pembaruan sistem.",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [200, 100, 200],
      data: {
        url: data.url || "/admin",
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});