import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import SEO from "../common/seo/SEO";
countries.registerLocale(enLocale);

// ATP/WTA ranking pages use IOC-style country codes that differ from ISO 3166-1 alpha-3
const IOC_TO_ISO3 = {
  GER: "DEU", SUI: "CHE", NED: "NLD", RSA: "ZAF", POR: "PRT", GRE: "GRC",
  CRO: "HRV", DEN: "DNK", LAT: "LVA", BUL: "BGR", CHI: "CHL", INA: "IDN",
  IRI: "IRN", PUR: "PRI", ISV: "VIR", IVB: "VGB", TPE: "TWN", MAS: "MYS",
  SLO: "SVN", ZIM: "ZWE", BAH: "BHS", GEO: "GEO", MGL: "MNG", NGR: "NER",
  CGO: "COG", ALG: "DZA", ANG: "AGO", BAR: "BRB", BER: "BMU", CAY: "CYM",
  ESA: "SLV", GUA: "GTM", GUY: "GUY", HAI: "HTI", HON: "HND", KUW: "KWT",
  LES: "LSO", MRI: "MUS", NCA: "NIC", OMA: "OMN", PAR: "PRY", SEY: "SYC",
  SKN: "KNA", SRI: "LKA", VIN: "VCT", ANT: "ATG",
};

// Normalizes a raw ranking-source country code (IOC or ISO alpha-3) to lowercase ISO alpha-3
export function normalizeRankingCountry(code) {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  return (IOC_TO_ISO3[upper] || upper).toLowerCase();
}

export function getAlpha3(countryParam) {
  if (!countryParam) return null;

  const clean = countryParam.trim();

  // 1) If input is alpha-2
  if (clean.length === 2) {
    return countries.alpha2ToAlpha3(clean.toUpperCase())?.toLowerCase() || null;
  }

  // 2) If input is alpha-3
  if (clean.length === 3) {
    const isAlpha3 = countries.alpha3ToAlpha2(clean.toUpperCase());
    if (isAlpha3) return clean.toLowerCase();
  }

  // 3) Try full country name → alpha-2 → alpha-3
  const alpha2 = countries.getAlpha2Code(clean, "en");
  if (alpha2) {
    return countries.alpha2ToAlpha3(alpha2)?.toLowerCase() || null;
  }

  // 4) Try full country name → alpha-3 directly
  const alpha3 = countries.getAlpha3Code(clean, "en");
  if (alpha3) return alpha3.toLowerCase();

  return null;
}

// export function getAlpha3(countryParam) {
//     if (!countryParam) return null;

//     // Normalize
//     const clean = countryParam.trim().toLowerCase();

//     // 1) Try if it's already an alpha-2 or alpha-3 code
//     const asAlpha3 = countries.alpha3ToAlpha2(clean.toUpperCase());
//     if (asAlpha3) return clean.toLowerCase();

//     // 2) Try converting from alpha-2
//     const alpha2 = countries.getAlpha2Code(clean, 'en');
//     if (alpha2) {
//         return countries.alpha2ToAlpha3(alpha2).toLowerCase();
//     }

//     // 3) Try converting from full name directly
//     const alpha3 = countries.getAlpha3Code(clean, 'en');
//     if (alpha3) return alpha3.toLowerCase();

//     return null;
// }

export function getAlpha2FromName(name) {
    if (!name) return null;

    const clean = name.trim().toLowerCase();

    // Get alpha-2 from name
    const alpha2 = countries.getAlpha2Code(clean, "en");

    return alpha2 ? alpha2.toLowerCase() : null;
}
export function getRouteKeyword() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes("live-scores")) return "live-scores";
    if (path.includes("live-tennis")) return "live-tennis";
    if (path.includes("tennis-score-live")) return "tennis-score-live";
    if (path.includes("scores")) return "scores";
    if (path.includes("rankings")) return "rankings";
    if (path.includes("players")) return "players";

    return ""; // fallback
}

export function getBaseRoute() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes("/live-scores")) return "/live-scores";
    if (path.includes("/live-tennis")) return "/live-tennis";
    if (path.includes("/tennis-score-live")) return "/tennis-score-live";

    return "/live-scores"; // default fallback
}


export function getH1(countryFullName = "") {
    const href = window.location.href;

    // Normalize country name
    const country = countryFullName
        ? countryFullName.charAt(0).toUpperCase() + countryFullName.slice(1)
        : null;

    // ---- Country Live Scores ----
    if (href.includes("/live-scores") && country) {
        return `Tennis ${country} - Live Scores & Results`;
    }

    if (href.includes("/tennis-score-live") && country) {
        return `Tennis Score Live - ${country} -  Scores & Results`;
    }
    if (href.includes("/tennis-live") && country) {
        return `Tennis Live - ${country} -  Scores & Results`;
    }
     if (href.includes("/live-tennis") && country) {
        return `Live Tennis - ${country} -  Scores & Results`;
    }
    // ---- SEO Route: /tennis-country/scores ----
    if (href.includes("/tennis-") && href.endsWith("/scores") && country) {
        return `Live Tennis Scores in ${country} - Results & Matches`;
    }

    // ---- All Matches ----
    if (href.includes("/all")) {
        return "All Tennis Matches - Live Scores & Results";
    }

    // ---- Rankings Live ----
    if (href.includes("/rankings/live")) {
        return "Live Tennis Rankings - ATP & WTA";
    }

    // ---- Rankings Official ----
    if (href.includes("/rankings/official")) {
        return "Official ATP & WTA Rankings";
    }

    // ---- Players List ----
    if (href.includes("/players/atp")) {
        return "ATP Tennis Players - Complete List";
    }

    if (href.includes("/players/wta")) {
        return "WTA Tennis Players - Complete List";
    }

    // ---- Player Profile ----
    if (href.includes("/player/atp")) {
        return "ATP Player Profile";
    }

    if (href.includes("/player/wta")) {
        return "WTA Player Profile";
    }

    // ---- Default ----
    return "Live Tennis Scores & Results";
}


export function getCountryFullName(str) {
    if (!str) return null;
    if (str.toLowerCase() === "all") return "all";

    const clean = str.toLowerCase().trim();

    // detect alpha-3 → alpha2
    if (clean.length === 3) {
        const alpha2 = countries.alpha3ToAlpha2(clean.toUpperCase());
        return countries.getName(alpha2, "en")?.toLowerCase() || null;
    }

    // detect alpha-2 → fullname
    if (clean.length === 2) {
        return countries.getName(clean.toUpperCase(), "en")?.toLowerCase() || null;
    }

    // detect full name → full name
    const alpha2 = countries.getAlpha2Code(clean, "en");
    if (alpha2) return countries.getName(alpha2, "en")?.toLowerCase();

    return null;
}

export function getSeoDom() {
    const path = window.location.pathname;

    // extract last segment (country)
    let countryParam = path.split("/").filter(Boolean).pop();
    let countryFullName = getCountryFullName(countryParam) || "global";

    // ===========================
    // /live-scores/:country
    // ===========================
    if (path.startsWith("/live-scores/")) {
        return (
            <SEO
                title={`Tennis ${countryFullName.toUpperCase()} Live - Countrywise Tennis Scores & Updates`}
                description={`Real-time tennis scores, rankings and updates for ${countryFullName}. Follow ATP, WTA and all major tournaments.`}
                keywords={`tennis scores, ${countryFullName} tennis, live scores, rankings, ATP, WTA`}
                url={`https://tennisindialive.com/live-scores/${countryParam}`}
            />
        );
    }

    // ===========================
    // /tennis/:country/scores
    // ===========================
    if (path.match(/^\/tennis\/[a-z-]+\/scores$/)) {
        return (
            <SEO
                title={`Tennis Scores for ${countryFullName.toUpperCase()} | Live ATP & WTA`}
                description={`Live tennis match results and rankings for ${countryFullName}. Updated instantly with ATP & WTA coverage.`}
                keywords={`tennis ${countryFullName}, ${countryFullName} scores, tennis live ${countryFullName}`}
                url={`https://tennisindialive.com${path}`}
            />
        );
    }

    // ===========================
    // /tennis-:country/scores (legacy redirect)
    // ===========================
    if (path.match(/^\/tennis-[a-z-]+\/scores$/)) {
        return (
            <SEO
                title={`Tennis Scores — ${countryFullName.toUpperCase()}`}
                description={`Live tennis scores and updates for ${countryFullName}.`}
                keywords={`tennis ${countryFullName}, live tennis ${countryFullName}`}
                url={`https://tennisindialive.com${path}`}
            />
        );
    }

    // ===========================
    // fallback SEO
    // ===========================
    return (
        <SEO
            title="Tennis Live Scores & ATP/WTA Rankings | TennisIndiaLive"
            description="Get real-time tennis scores, match updates and player rankings across ATP & WTA."
            keywords="tennis live scores, atp rankings, wta rankings"
            url="https://tennisindialive.com"
        />
    );
}
