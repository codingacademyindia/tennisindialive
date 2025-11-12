// src/components/SEO.js
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Tennis India Live | Countrywise Tennis Scores & Global Updates',
  description = 'Track live tennis scores countrywise from ATP, WTA & ITF events..',
  keywords = 'countrywise tennis scores, live tennis, ATP, WTA, ITF, tennis rankings',
  url = window.location.href,
  jsonLd = null, // Optional: pass custom JSON-LD
}) => {
  // Default JSON-LD (WebPage + Organization)
  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "keywords": keywords,
    "url": url,
    "description": description,
    "inLanguage": "en",
    "publisher": {
      "@type": "Organization",
      "name": "Tennis India Live",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.tennisindialive.com/ball.png"
      }
    },
    "mainEntity": {
      "@type": "SportsOrganization",
      "name": "Global Tennis Federation",
      "sport": "Tennis",
      "url": "https://www.tennisindialive.com",
      "description": "Provides live tennis data and country-specific score tracking..."
    },
    "specialFeature": "Countrywise tennis scores and player rankings — filter matches by nation..."
  };

  // Merge with custom jsonLd if provided
  const structuredData = jsonLd ? { ...defaultJsonLd, ...jsonLd } : defaultJsonLd;

  return (
    <Helmet>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://www.tennisindialive.com/og-default.jpg" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.tennisindialive.com/og-default.jpg" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
};

export default SEO;