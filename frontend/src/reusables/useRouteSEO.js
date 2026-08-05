import { useLocation } from "react-router-dom";
import seoConfig from "./seoConfig";

export default function useRouteSEO() {
  const { pathname } = useLocation();

  for (const item of seoConfig) {
    if (item.match.test(pathname)) {
      return {
        title: item.title,
        description: item.description,
        keywords: item.keywords,
        url: `https://www.tennisindialive.com${pathname}`
      };
    }
  }

  // default / fallback SEO
  return {
    title: "Tennis Live Scores & Rankings | TennisIndiaLive",
    description: "Live tennis scores and rankings across ATP and WTA.",
    keywords: "tennis, live scores, atp, wta, tennis results",
    url: `https://www.tennisindialive.com${pathname}`
  };
}
