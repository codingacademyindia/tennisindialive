import React, { useEffect, useState } from "react";

const RSSFeed = () => {
  const [items, setItems] = useState([]);
  const [filterText, setFilterText] = useState(""); // Search filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sources = [
    // Indian news sources
    // { name: "Sportstar", url: "https://indiantennisdaily.com/feed/" },
    { name: "TheHindu", url: "https://www.thehindu.com/sport/feeder/default.rss" },
    // { name: "Sportstar", url: "https://sportstar.thehindu.com/rssfeeds/10667/rssfeeds.xml" },
    // { name: "The Bridge", url: "https://thebridge.in/tennis/rss/" },

    { name: "ESPN", url: "https://www.espn.com/espn/rss/tennis/news" },
    // { name: "BBC", url: "https://feeds.bbci.co.uk/sport/tennis/rss.xml" },
    { name: "ATP Tour", url: "https://www.atptour.com/en/media/rss-feed/xml-feed" },
    { name: "WTA", url: "https://www.wtatennis.com/rss/news" },
    { name: "Tennis.com", url: "https://www.tennis.com/rss-feed/" },
    // { name: "TennisworldUSA", url: "https://www.tennisworldusa.org/rss/news.php" },
    // { name: "TennisworldUSA", url: "https://www.tennisworldusa.org/rss/news.php" },
    // { name: "GuardianTennis", url: "https://www.theguardian.com/sport/tennis/rss" },
    // { name: "YahooSportsTennis", url: "https://www.theguardian.com/sport/tennis/rss" },
    // { name: "SkySportsTennis", url: "https://www.theguardian.com/sport/tennis/rss" },
    { name: "LiveRankingNews", url: "https://live-tennis.eu/en/news/rss" },
    // { name: "USTA News", url: "https://www.usta.com/en/home/rss/news.html" },
    // { name: "Tennis Now", url: "https://www.tennisnow.com/rss.aspx" },


  ];

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        setLoading(true);
        setError("");

        const allItems = await Promise.all(
          sources.map(async (source) => {
            try {
              // Use a proxy to bypass CORS restrictions
              const proxy = "https://api.allorigins.win/get?url=";
              const response = await fetch(proxy + encodeURIComponent(source.url));

              if (!response.ok) {
                console.error(`Error fetching ${source.name}: ${response.statusText}`);
                return [];
              }

              const data = await response.json();
              const parser = new DOMParser();
              const xml = parser.parseFromString(data.contents, "application/xml");
              
              let items = Array.from(xml.querySelectorAll("item"))
                .map((item) => ({
                  title: item.querySelector("title")?.textContent || "No title",
                  link: item.querySelector("link")?.textContent || "#",
                  description: item.querySelector("description")?.textContent || "No description",
                  pubDate: item.querySelector("pubDate")?.textContent || "No date",
                  source: source.name
                }));
              
              // Filter "The Hindu" articles to include only those with "tennis" in the link
              if (source.url.includes("thehindu")) {
                items = items.filter((item) => item.link.toLowerCase().includes("tennis"));
              }
              
              console.log(`Fetched ${items.length} articles from ${source.name}`);
              return items;
            } catch (err) {
              console.error(`Error parsing ${source.name}:`, err);
              return [];
            }
          })
        );

        const sortedItems = allItems.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        setItems(sortedItems);
      } catch (error) {
        console.error("Error fetching RSS feeds:", error);
        setError("Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    fetchRSS();
  }, []);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(filterText.toLowerCase()) ||
    item.description.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="w-[80%] mx-auto p-1">
     <div className="w-full flex flex-row  items-center border-solid border-navy border-b-[1px] m-1 bg-slate-100 ">
                <div className="text-2xl font-bold text-left  w-[50%]">Latest Tennis News</div>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search News..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-[50%] m-2 p-2 border rounded-md mb-4"
                    aria-label="Search Players"
                />
            </div>  
      {/* <h1 className="text-2xl font-bold mb-4">Latest Tennis News</h1>

      {/* Search Input */}
      {/* <input
        type="text"
        placeholder="Search news..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />  */}

      {/* Loading & Error Handling */}
      {loading && <p>Loading news...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* News List */}
      {filteredItems.length > 0 ? (
        <ul className="space-y-4">
          {filteredItems.map((item, index) => (
            <li key={index} className="border-b pb-4">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:underline">
                {item.title}
              </a>
              <p className="text-sm text-gray-600">
                <strong>Source:</strong> {item.source} | <strong>Date:</strong> {new Date(item.pubDate).toLocaleString()}
              </p>
              <p className="text-sm">{item.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No news found.</p>
      )}
    </div>
  );
};

export default RSSFeed;
