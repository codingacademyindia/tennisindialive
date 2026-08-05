import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const FluidAd = () => {
  const insRef = useRef(null);
  const pushedRef = useRef(false);
  const attemptRef = useRef(0);
  const roRef = useRef(null);
  const location = useLocation();

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const loadAdScript = () =>
    new Promise((resolve, reject) => {
      const srcPrefix = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      const existing = document.querySelector(`script[src^="${srcPrefix}"]`);
      if (existing) {
        // script may already be loaded
        if (window.adsbygoogle) return resolve();
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("adsbygoogle load error")));
        return;
      }
      const s = document.createElement("script");
      s.async = true;
      s.src = `${srcPrefix}?client=ca-pub-6294891577483667`;
      s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("adsbygoogle network error"));
      document.head.appendChild(s);
    });

  const tryPush = async () => {
    const ins = insRef.current;
    if (!ins) return;
    // require a minimum visible size for fluid ad
    const rect = ins.getBoundingClientRect();
    if (rect.width < 200 || rect.height < 50) {
      // wait until it has reasonable size
      return;
    }

    if (pushedRef.current) return;
    if (!window.adsbygoogle) {
      // if script not ready, let init effect handle it
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
      console.debug("adsbygoogle.push() success");
    } catch (err) {
      console.warn("adsbygoogle.push() failed, will retry:", err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const MAX_ATTEMPTS = 12;
    const RETRY_MS = 500;

    const init = async () => {
      attemptRef.current = 0;
      pushedRef.current = false;

      try {
        await loadAdScript();
      } catch (err) {
        console.error("Failed to load AdSense script:", err);
        return;
      }

      // ResizeObserver to attempt push when size changes
      if (typeof ResizeObserver !== "undefined" && insRef.current) {
        roRef.current = new ResizeObserver(() => {
          if (cancelled) return;
          tryPush();
        });
        roRef.current.observe(insRef.current);
      }

      // Poll/retry until pushed or max attempts
      const poll = async () => {
        if (cancelled) return;
        if (pushedRef.current) return;
        if (attemptRef.current >= MAX_ATTEMPTS) {
          console.warn("Ad push attempts exhausted");
          return;
        }
        attemptRef.current += 1;
        await tryPush();
        if (!pushedRef.current) setTimeout(poll, RETRY_MS);
      };
      poll();
    };

    init();

    return () => {
      cancelled = true;
      pushedRef.current = false;
      attemptRef.current = 0;
      if (roRef.current) {
        roRef.current.disconnect();
        roRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only once for script/load and observers

  // re-run push attempts on route change (SPA navigation)
  useEffect(() => {
    // clear state so push can be retried on navigation
    pushedRef.current = false;
    attemptRef.current = 0;
    // small delay to allow layout to settle after navigation
    const t = setTimeout(() => tryPush(), 150);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <div className="w-full flex justify-center my-2">
      <div className="w-full max-w-[970px] min-h-[150px]">
        <ins className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" , textAlign: "center"}}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-6294891577483667"
          data-ad-slot="6173781868"></ins>
      </div>
    </div>
  );
};

export default FluidAd;