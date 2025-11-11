import React, { useEffect, useRef } from "react";

const AdUnitTop = () => {
  const adRef = useRef(null);
  const pushedRef = useRef(false);

  const AD_CLIENT = "ca-pub-6294891577483667";
  const AD_SLOT = "2267499900";

  // Load AdSense script only once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.adsbygoogle) return;

    const existingScript = document.querySelector(
      'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    );
    if (existingScript) {
      existingScript.onload = () => {
        window.adsbygoogle = window.adsbygoogle || [];
      };
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      window.adsbygoogle = window.adsbygoogle || [];
    };
    document.head.appendChild(script);
  }, []);

  // Push ad safely once the element is visible
  useEffect(() => {
    if (typeof window === "undefined") return;
    pushedRef.current = false;

    const tryPush = () => {
      if (!window.adsbygoogle || !adRef.current) {
        requestAnimationFrame(tryPush);
        return;
      }

      if (pushedRef.current) return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (err) {
        console.warn("AdSense push failed:", err);
      }
    };

    requestAnimationFrame(tryPush);
  }, []);

  return (
    <div
      ref={adRef}
      className="flex justify-center"
      style={{ width: "100%"}}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          height: "100px",
        }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdUnitTop;
