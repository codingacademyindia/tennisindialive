import React, { useState, useEffect } from "react";
import { registerPush } from "../pushSubscription"; // adjust path as needed

const PushTestButton = ({
  title = "🎾 Test Notification",
  body = "Your TennisIndiaLive push is working!",
  url = "https://tennisindialive.com/live",
  buttonText = "Send Test Notification",
  backendUrl = "http://localhost:3223/push/notify",
}) => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      if (!res.ok) throw new Error("Failed to send push");
    //   alert("✅ Test push triggered — check your notifications!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send push notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!subscribed || loading}
      className={`px-5 py-3 h-fit w-fit rounded-lg font-medium text-white ${
        subscribed
          ? "bg-green-600 hover:bg-green-700"
          : "bg-gray-400 cursor-not-allowed"
      }`}
    >
      {loading ? "Sending..." : buttonText}
    </button>
  );
};

export default PushTestButton;
