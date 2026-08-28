self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "Jarvis", body: "Check-in time." };
  event.waitUntil(
    self.registration.showNotification(data.title || "Jarvis", {
      body: data.body,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
