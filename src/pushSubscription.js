const PUBLIC_VAPID_KEY = "BAWv5Ytw-0qWsC7IvOaqyJF7Uu2nN1LC9vaBWJ5zLwVBkpHGO5DUxo42r76RTDIGEtFxqHWYNP_4elcnz_APDUM"; // from your backend setup

export async function registerPush() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service workers not supported");
    return;
  }

  // Register service worker
  const registration = await navigator.serviceWorker.register("/sw.js");
  console.log("✅ Service worker registered:", registration);

  // Ask for permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Permission denied for notifications");
    return;
  }

  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });

  console.log("✅ Got subscription:", subscription);

  // Send subscription to backend
  await fetch("http://localhost:3223/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  console.log("📬 Subscription sent to backend");
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
