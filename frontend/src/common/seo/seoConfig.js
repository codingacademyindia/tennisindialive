const seoConfig = [
  {
    match: /^\/$/,  
    title: "Tennis Live Scores | ATP & WTA Live | TennisIndiaLive",
    description: "Real-time tennis live scores for ATP, WTA, challengers, and ITF events.",
    keywords: "tennis live scores, atp live, wta live, tennis scores",
  },
  {
    match: /^\/live-scores$/,
    title: "Live Tennis Scores | ATP & WTA | Tennis India Live",
    description: "Latest live tennis scores updated instantly.",
    keywords: "live tennis scores, today's tennis matches, atp live score",
  },
  {
    match: /^\/tennis-([a-z]+)\/scores$/,
    title: "Tennis Country Scores | Live Countrywise Tennis Scores",
    description: "Live countrywise tennis scores for ATP & WTA players.",
    keywords: "country tennis scores, tennis india, tennis usa",
  },
  {
    match: /^\/players\/atp$/,
    title: "ATP Players List | Men's Tennis Players",
    description: "Explore ATP tennis players, rankings, profiles and match results.",
    keywords: "atp players, men's tennis, tennis players list",
  },
  {
    match: /^\/players\/wta$/,
    title: "WTA Players List | Women's Tennis Players",
    description: "Explore WTA tennis players, rankings, profiles and match results.",
    keywords: "wta players, women's tennis, tennis players list",
  },
  {
    match: /^\/rankings\/live\/atp-singles$/,
    title: "Live ATP Rankings (Singles) | Updated Daily",
    description: "Daily updated ATP singles live rankings.",
    keywords: "live atp rankings, atp singles ranking, tennis ranking",
  },
  {
    match: /^\/rankings\/live\/wta-singles$/,
    title: "Live WTA Rankings (Singles) | Updated Daily",
    description: "Daily updated WTA singles live rankings.",
    keywords: "live wta rankings, wta singles ranking, tennis ranking",
  },

  // 👇 add ANY new route here in seconds
  {
    match: /^\/news$/,
    title: "Latest Tennis News | ATP, WTA & Grand Slam Updates",
    description: "Read latest tennis news from around the world.",
    keywords: "tennis news, atp news, wta news"
  }
];

export default seoConfig;
