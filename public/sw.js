self.addEventListener("push", (event) => {
  console.log("[SW] Push event received", event);
  if (!event.data) {
    console.log("[SW] No event data");
    return;
  }

  try {
    const { title, body, url } = event.data.json();
    console.log("[SW] Push data:", { title, body, url });

    const options = {
      body,
      icon: "/icon-192x192.png",
      data: { url },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("[SW] Push handling error:", err);
  }
});
