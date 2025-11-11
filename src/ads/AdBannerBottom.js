import { useEffect } from "react";

const AdBannerBottom = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn("AdSense push failed:", e);
      }
    }, 800); // small delay for layout stabilization

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
        data-ad-client="ca-pub-6294891577483667"
        data-ad-slot="4336750739"
        data-ad-format="autorelaxed"
      />
    </div>
  );
};

export default AdBannerBottom;
