from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import json, os
import time, datetime
from ftp_upload_server import FTPUploader
from helpers import *
# Automatically download and set up ChromeDriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from helpers import *
import common.tweet as tweet

from file_utils import FileUtils

# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
# if sys.stdout.closed:
#     sys.stdout = open(os.devnull, "w")  # Prevent crash


options = Options()
# options.add_argument("--headless")  # Run in headless mode (optional)

# Set up WebDriver using webdriver-manager
service = Service(ChromeDriverManager().install())

# URL to scrape

def to_number(value):
    try:
        # Try to convert to integer
        if '.' in value:
            return float(value)
        else:
            return int(value)
    except ValueError:
        return None  # or you can return 0, or raise an error if you prefer
def isInt(value):
    try:
        int(value)
        return True
    except ValueError:
        return False
def fetch_ranking(url, max_rank):
    global xpath
    file_name=url.split("/")[len(url.split("/"))-1]
    if "atp" in file_name:
        file_name = f"ranking/official/atp/{file_name}.json"
    else:
        file_name = f"ranking/official/wta/{file_name}.json"
    driver.get(url)
    # Wait for elements to load (optional)
    time.sleep(3)
    # Find all elements matching the XPath
    xpath = "//div[@id='plyrRankings']/table/tbody//tr"
    rows = driver.find_elements(By.XPATH, xpath)
    # Extract all <td> contents inside each <tr> and store them in JSON format
    data = []
    i=0
    print(f"data fetched {len(rows)}...")
    print("processing data....")
    for row in rows:
        if i>max_rank:
            break
        cells = row.find_elements(By.TAG_NAME, "td")

        if len(cells) >= 6:  # Ensure row has enough columns
            if "live" in file_name:
                age, career_high, change, country, player, points, rank = live_ranking(cells)
            else:
                age, career_high, change, country, player, points, rank = official_ranking(cells)
            if isInt(change):
                data.append({
                    "rank": rank,
                    "player": player,
                    "age": age,
                    "country": country,
                    "points": points,
                    "career_high": career_high,
                    "change": change
                })
            i=i+1
    # Store data in JSON file
    print(f"data processed {len(data)}")

    print(f"updating text file {file_name}")

    return data
    # with open(file_name, "w", encoding="utf-8") as json_file:
    #     json.dump(data, json_file, ensure_ascii=False, indent=4)


def live_ranking(cells):
    rank = cells[0].text.strip()  # td[1] (Index 0)
    career_high = cells[1].text.strip()  # td[3] (Index 2)
    player = cells[3].text.strip()  # td[3] (Index 2)
    age = cells[4].text.strip()  # td[4] (Index 3)
    country = cells[5].text.strip()  # td[5] (Index 4)
    points = cells[6].text.strip()  # td[6] (Index 5)
    change = cells[7].text.strip()  # td[6] (Index 5)
    # print(f"{rank}")
    # print(str(rank))
    return age, career_high, change, country, player, points, rank


def official_ranking(cells):
    rank = cells[0].text.strip()  # td[1] (Index 0)
    player = cells[2].text.strip()  # td[3] (Index 2)
    age = cells[3].text.strip()  # td[4] (Index 3)
    country = cells[4].text.strip()  # td[5] (Index 4)
    points = cells[5].text.strip()  # td[6] (Index 5)
    change = cells[6].text.strip()  # td[6] (Index 5)
    # print(str(rank))
    # print(f"{rank}")
    return age, "", change, country, player, points, rank


def generate_ranking_url(slug):
    """
    Converts ranking slugs into full Tennis India Live URLs.

    Args:
        urls (list[str]): List of slug strings like 'official-atp-ranking'

    Returns:
        list[str]: List of full URLs.
    """
    base_url = "https://tennisindialive.com/rankings"
    result = []

    parts = slug.split('-')
    ranking_type = parts[0]  # 'official' or 'live'
    org = parts[1]  # 'atp' or 'wta'
    category = 'singles' if 'doubles' not in slug else 'doubles'

    # Construct URL
    full_url = f"{base_url}/{ranking_type}/{org}-{category}"

    return full_url

def generate_tweet_line(url: str) -> str:
    # Always work in lowercase for reliable comparison
    url_lower = url.lower()

    # Determine organization by checking text content
    if "atp" in url_lower:
        org = "ATP"
    elif "wta" in url_lower:
        org = "WTA"
    else:
        org = ""

    # Determine category using simple text presence
    if "doubles" in url_lower:
        category = "Doubles"
    else:
        category = "Singles"

    return f"🇮🇳 Indian Players in Live {org} {category} Rankings 🇮🇳"

def generate_indian_rankings_tweet(players, url, limit):
    """
    Generates a tweet listing Indian tennis players from a ranking list.

    Args:
        players (list[dict]): List of player data (each must include 'rank', 'player', 'country', 'points', 'change').

    Returns:
        str: A formatted tweet string.
    """
    # Filter Indian players
    indian_players = [p for p in players if p.get('country') == 'IND']
    if not indian_players:
        return f"🇮🇳 No Indian players found in this week's Top {limit} rankings. #TennisIndia"

    # Sort by rank
    indian_players.sort(key=lambda x: int(x['rank']))

    # Tweet header
    tweet_lines = [generate_tweet_line(url), ""]
    num_emoji_map = {
        "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣", "5": "5️⃣",
        "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣", "10": "🔟"
    }

    # Add player lines
    for p in indian_players:
        change = p.get('change', '').strip()
        symbol = "⬆️" if change.startswith('+') else "⬇️" if change.startswith('-') else ""
        change_display = f" ({symbol}{change})" if change else ""

        # Inside your loop:
        rank_str = p['rank']
        rank_display = num_emoji_map.get(rank_str, f"#{rank_str}")

        tweet_lines.append(f"{rank_display} {p['player']} — {p['points']} pts{change_display}")

    # Footer / hashtags
    tweet_lines.append("")
    tweet_lines.append(f"Track Rankings here - {generate_ranking_url(url)}")
    tweet_lines.append("")
    tweet_lines.append("#IndianTennis #ATPRankings #TennisIndia")

    return "\n".join(tweet_lines)

urls = ["atp-live-ranking","atp-doubles-live-ranking","wta-live-ranking","wta-doubles-live-ranking"]

obj_timestamp={}
for url in urls:
    print(f"fetching ranking {url}")
    driver = webdriver.Chrome(service=service, options=options)

    obj_data=fetch_ranking(f"https://live-tennis.eu/en/{url}", 1000)
    tweet_text=generate_indian_rankings_tweet(obj_data,url, 1000)
    print(f"{tweet_text}")
    tweet.create_tweet(tweet_text, "prod")
    # Close the driver
    driver.close()
    driver.quit()
