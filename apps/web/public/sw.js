// Sellspace Service Worker — Web Push Notifications
// Receives push events and displays OS notifications.

/// <reference lib="webworker" />

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "Sellspace";
  const body = data.body ?? "";
  const url = data.url ?? "/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon.png",
      badge: "/icon.png",
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing tab if possible
        const existing = clientList.find(
          (c) =>
            c.url.startsWith(self.location.origin) && "focus" in c,
        );
        if (existing) {
          return existing.focus().then((c) => c.navigate(url));
        }
        return clients.openWindow(url);
      }),
  );
});
