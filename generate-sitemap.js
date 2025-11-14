// generate-sitemap.js
const fs = require("fs");
const path = require("path");

const baseUrl = "https://www.tennisindialive.com";

// List of all active tennis countries (lowercase)
const countries = [
  "india", "australia", "united-states", "france", "spain", "united-kingdom",
  "germany", "italy", "canada", "switzerland", "japan", "china", "russia",
  "argentina", "brazil", "netherlands", "belgium", "austria", "czech-republic",
  "slovakia", "sweden", "norway", "finland", "denmark", "mexico", "south-korea"
];

// Static URLs (no params)
const staticUrls = [
  "/", "/live-scores", "/live-tennis", "/tennis-score-live",
  "/players/atp", "/players/wta",
  "/rankings/live/atp-singles", "/rankings/live/atp-doubles",
  "/rankings/live/wta-singles", "/rankings/live/wta-doubles",
  "/rankings/official/atp-singles", "/rankings/official/atp-doubles",
  "/rankings/official/wta-singles", "/rankings/official/wta-doubles",
  "/privacypolicy", "/aboutus", "/contactus",
  "/termsofservice", "/playerinforequest",
  "/news", "/all"
];

let dynamicUrls = [];

// =========================
// COUNTRY-BASED SCORE ROUTES
// =========================
for (const c of countries) {
  dynamicUrls.push(`/live-scores/${c}`);
  dynamicUrls.push(`/live-tennis/${c}`);
  dynamicUrls.push(`/tennis-score-live/${c}`);
  dynamicUrls.push(`/tennis/${c}/scores`);
  dynamicUrls.push(`/tennis-${c}/scores`); // legacy SEO redirect, still index it
}

// =========================
// RANKINGS ROUTES (country specific)
// =========================
const rankingTypes = [
  "atp-singles", "atp-doubles", "wta-singles", "wta-doubles"
];

for (const type of rankingTypes) {
  for (const c of countries) {
    dynamicUrls.push(`/rankings/live/${type}/${c}`);
    dynamicUrls.push(`/rankings/official/${type}/${c}`);
  }
}

// =========================
// PLAYER PAGES (optional: you can expand with known players)
// =========================
const playerRoutes = [
  "/player/atp/",     // will dynamically append names later
  "/player/wta/"
];

// =========================
// DATE-BASED RESULTS ROUTES (last ~30 days)
// =========================
const today = new Date();
for (let i = 0; i < 30; i++) {
  const d = new Date();
  d.setDate(today.getDate() - i);

  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");

  dynamicUrls.push(`/results/${yyyy}/${mm}/${dd}`);
  dynamicUrls.push(`/results/all/${yyyy}/${mm}/${dd}`);
}

// Combine all routes
const urls = [...staticUrls, ...dynamicUrls];

// Build XML
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (url) => `  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>daily</changefreq>
    <priority>${url === "/" ? "1.0" : "0.7"}</priority>
  </url>`
    )
    .join("\n") +
  "\n</urlset>";

// Output file
fs.writeFileSync(path.join(__dirname, "public", "sitemap.xml"), sitemap, "utf8");

console.log("✅ Sitemap generated successfully!");
