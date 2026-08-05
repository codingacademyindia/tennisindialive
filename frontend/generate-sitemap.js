const fs = require("fs");
const path = require("path");

// ========= CONFIG =========

// full country names in lowercase
const countries = [
  "india", "australia", "united-states", "france", "spain", "united-kingdom",
  "germany", "italy", "canada", "switzerland", "japan", "china",
  "russia", "argentina", "brazil", "netherlands", "belgium",
  "austria", "czech-republic", "slovakia"
];

// alpha-3 codes aligned with above list
const countryAlpha3 = [
  "IND", "AUS", "USA", "FRA", "ESP", "GBR", "GER", "ITA", "CAN",
  "SUI", "JPN", "CHN", "RUS", "ARG", "BRA", "NED", "BEL", "AUT",
  "CZE", "SVK"
];

// last 30 days of result pages
function generateDatePages() {
  const items = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    items.push(`/results/${year}/${month}/${day}`);
    items.push(`/results/all/${year}/${month}/${day}`);
  }

  return items;
}

// ========= STATIC ROUTES =========
const staticRoutes = [
  "/", "/all",
  "/live-scores", "/tennis-score-live", "/live-tennis",
  "/tennis-live",        // NEW
  "/privacypolicy", "/aboutus", "/contactus",
  "/termsofservice", "/playerinforequest",
  "/news",
  "/players/atp", "/players/wta"
];

// ========= DYNAMIC COUNTRY ROUTES =========
function generateCountryRoutes() {
  const routes = [];
  countries.forEach(country => {

    // primary SEO pages
    routes.push(`/live-scores/${country}`);
    routes.push(`/tennis-score-live/${country}`);
    routes.push(`/live-tennis/${country}`);
    routes.push(`/tennis-live/${country}`);      // NEW
    routes.push(`/tennis/${country}/scores`);

  });
  return routes;
}

// ========= RANKING ROUTES =========
function generateRankingRoutes() {
  const routes = [];

  ["atp", "wta"].forEach(type => {
    routes.push(`/rankings/live/${type}`);
    routes.push(`/rankings/official/${type}`);

    countryAlpha3.forEach(code => {
      routes.push(`/rankings/live/${type}/${code.toLowerCase()}`);
      routes.push(`/rankings/official/${type}/${code.toLowerCase()}`);
    });
  });

  return routes;
}

// ========= PLAYER PROFILE ROUTES (optional basic list) =========
function generatePlayerRoutes() {
  return [
    "/player/atp/novak-djokovic",
    "/player/atp/roger-federer",
    "/player/atp/rafael-nadal",
    "/player/wta/iga-swiatek",
    "/player/wta/naomi-osaka",
    // add more if needed
  ];
}

// ========= BUILD XML =========
const allRoutes = [
  ...staticRoutes,
  ...generateCountryRoutes(),
  ...generateRankingRoutes(),
  ...generateDatePages(),
  ...generatePlayerRoutes()
];

const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(route => {
    return `
  <url>
    <loc>https://tennisindialive.com${route}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

// ========= WRITE FILE =========
const outputPath = path.join(__dirname, "public", "sitemap.xml");
fs.writeFileSync(outputPath, sitemapXML);

console.log("✅ Sitemap generated at public/sitemap.xml");
