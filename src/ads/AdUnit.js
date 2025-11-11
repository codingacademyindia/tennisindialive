import React, { useEffect, useRef } from 'react';

// ...existing code...
const AD_CLIENT = 'ca-pub-6294891577483667';

const AdUnit = ({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  className = 'my-1 flex justify-center max-h-[100px] h-[100px]',
  style = {}
}) => {
  const adRef = useRef(null);
  const pushedRef = useRef(false);

  // Inject ads script if not already present; set window.adsbygoogle onload
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.adsbygoogle) return;

    const existing = document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
    if (existing) {
      existing.onload = () => { window.adsbygoogle = window.adsbygoogle || []; };
      return;
    }

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
    s.crossOrigin = 'anonymous';
    s.onload = () => { window.adsbygoogle = window.adsbygoogle || []; };
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    pushedRef.current = false;
    let ro;
    let rafId = 0;
    let attempts = 0;
    const MAX_ATTEMPTS = 180; // ~3s at 60fps

    const isVisibleSized = (el) => {
      if (!el) return false;
      // must be in layout
      if (el.offsetParent === null && el.getClientRects().length === 0) return false;
      const rect = el.getBoundingClientRect();
      if (!rect || rect.width < 1) return false;
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
      return true;
    };

    const tryPush = () => {
      const el = adRef.current;
      if (!el) {
        rafId = requestAnimationFrame(tryPush);
        return;
      }

      if (!window.adsbygoogle) {
        // wait for the script to load
        rafId = requestAnimationFrame(tryPush);
        return;
      }

      if (!isVisibleSized(el)) {
        attempts += 1;
        if (attempts > MAX_ATTEMPTS) {
          // give up gracefully
          return;
        }
        rafId = requestAnimationFrame(tryPush);
        return;
      }

      if (pushedRef.current) return;

      try {
        // ins must exist in DOM before calling push
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (e) {
        // minimal logging
        // eslint-disable-next-line no-console
        console.warn('AdSense push failed:', e);
      }
    };

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        if (!pushedRef.current) tryPush();
      });
      if (adRef.current) ro.observe(adRef.current);
    }

    rafId = requestAnimationFrame(tryPush);
    const onResize = () => { if (!pushedRef.current) tryPush(); };
    window.addEventListener('resize', onResize);

    return () => {
      if (ro && adRef.current) ro.unobserve(adRef.current);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [slot, format, responsive]);

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{...style }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={String(slot)}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdUnit;
// ...existing code...