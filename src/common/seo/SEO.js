// src/components/SEO.js
import React from 'react';
import { Helmet } from 'react-helmet-async';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale);

const SEO = ({
  title = 'Tennis India Live | Countrywise Tennis Scores & Global Updates',
  description = 'Track live tennis scores countrywise from ATP, WTA & ITF events..',
  keywords = 'countrywise tennis scores, live tennis, ATP, WTA, ITF, tennis rankings',
  url = typeof window !== 'undefined' ? window.location.href : '',
  jsonLd = null,
}) => {
  // Extract country alpha-3 code from URL (e.g., "aus" from "/live-scores/aus")
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const countryAlpha3 = path.split('/').pop()?.toUpperCase();

  // Convert alpha-3 → alpha-2 for flag CDN
  const alpha2 = countries.alpha3ToAlpha2(countryAlpha3);

  // Default favicon if no valid country found
  const faviconUrl = alpha2
    ? `https://flagcdn.com/32x24/${alpha2.toLowerCase()}.png`
    : 'https://www.tennisindialive.com/ball.png';

  // JSON-LD
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
      "name": "Tennis Live",
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

  const structuredData = jsonLd ? { ...defaultJsonLd, ...jsonLd } : defaultJsonLd;

  return (
    <Helmet>
      {/* Basic */}
      <title>{title}</title>
      <link rel="icon" type="image/png" href={faviconUrl} />
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

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
};

export default SEO;
