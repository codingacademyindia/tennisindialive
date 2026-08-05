import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const FluidAd = () => {
  const insRef = useRef(null);
  const location = useLocation();

  const isLocalhost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  useEffect(() => {
    if (isLocalhost) return; // Google won't serve ads locally

    // Load script once
    const existing = document.querySelector(
      'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    );
    if (!existing) {
      const s = document.createElement("script");
      s.async = true;
      s.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6294891577483667";
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }

    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle && insRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.debug("AdSense ad pushed successfully");
        }
      } catch (e) {
        console.warn("AdSense push failed:", e);
      }
    }, 800); // slight delay allows layout & script to settle

    return () => clearTimeout(timer);
  }, [location, isLocalhost]); // re-push on route change

  if (isLocalhost) return null;

  return (
    <div className="w-full flex justify-center my-2">
      <div className="w-full max-w-[970px] min-h-[150px]">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-format="fluid"
          data-ad-layout-key="-fb+5w+4e-db+86"
          data-ad-client="ca-pub-6294891577483667"
          data-ad-slot="7445118045"
        ></ins>
      </div>
    </div>
  );
};

export default FluidAd;
