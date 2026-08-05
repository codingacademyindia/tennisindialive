import React, { useState, useEffect } from "react";
import { registerPush } from "../pushSubscription"; // your same helper

const PushNotifier = ({
  sendNow = false, // 👈 trigger flag
  title = "🎾 Live Tennis Update",
  body = "New scores available — check now on TennisIndiaLive!",
  url = "https://tennisindialive.com/live",
  backendUrl = "http://localhost:3223/push/notify",
}) => {
  const [subscribed, setSubscribed] = useState(false);

  // Step 1: Register for push once
  useEffect(() => {
    const setup = async () => {
      try {
        await registerPush();
        setSubscribed(true);
      } catch (err) {
        console.error("Push registration failed:", err);
      }
    };
    setup();
  }, []);

  // Step 2: Auto-trigger notification when flag changes
  useEffect(() => {
    if (!sendNow || !subscribed) return;

    const sendNotification = async () => {
      try {
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body, url }),
        });
        if (!res.ok) throw new Error("Failed to send push notification");
        console.log("✅ Push notification triggered automatically");
      } catch (err) {
        console.error("❌ Failed to send push notification:", err);
      }
    };

    sendNotification();
  }, [sendNow, subscribed]);

  return null; // 👈 invisible component
};

export default PushNotifier;
