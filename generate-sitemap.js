// generate-sitemap.js
const fs = require("fs");
const path = require("path");

const baseUrl = "https://www.tennisindialive.com";

const countries = ["ind", "aus", "usa", "fra", "esp", "gbr", "ger", "ita", "can"];

const staticUrls = [
  "/",
  "/players/atp",
  "/players/wta",
  "/rankings/live/atp-singles",
  "/rankings/live/atp-doubles",
  "/rankings/live/wta-singles",
  "/rankings/live/wta-doubles",
  "/rankings/official/atp-singles",
  "/rankings/official/atp-doubles",
  "/rankings/official/wta-singles",
  "/rankings/official/wta-doubles",
];

const dynamicUrls = [];

// Generate live and official ranking links for each country
for (const c of countries) {
  dynamicUrls.push(`/rankings/live/atp-singles/${c}`);
  dynamicUrls.push(`/rankings/live/atp-doubles/${c}`);
  dynamicUrls.push(`/rankings/live/wta-singles/${c}`);
  dynamicUrls.push(`/rankings/live/wta-doubles/${c}`);
  dynamicUrls.push(`/rankings/official/atp-singles/${c}`);
  dynamicUrls.push(`/rankings/official/atp-doubles/${c}`);
  dynamicUrls.push(`/rankings/official/wta-singles/${c}`);
  dynamicUrls.push(`/rankings/official/wta-doubles/${c}`);
  dynamicUrls.push(`/live-scores/${c}`);
}

const urls = [...staticUrls, ...dynamicUrls];

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
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

fs.writeFileSync(path.join(__dirname, "public", "sitemap.xml"), sitemap, "utf8");

console.log("✅ Sitemap generated successfully!");
