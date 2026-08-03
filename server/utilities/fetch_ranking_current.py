import datetime

from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import json
import time
import re
from pathlib import Path
from file_utils import FileUtils
import psycopg2
from psycopg2 import sql
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Automatically download and set up ChromeDriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import sys
import io, os


options = Options()
# options.add_argument("--headless")  # Run in headless mode (optional)

# Set up WebDriver using webdriver-manager
service = Service(ChromeDriverManager().install())
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
DB_SCHEMA = os.getenv("DB_SCHEMA", "public")
ENABLE_LOCAL_COPY = os.getenv("ENABLE_LOCAL_COPY", "0") == "1"
RECORD_LIMIT = int(os.getenv("RECORD_LIMIT", "10"))


def to_int(value):
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    digits = re.sub(r"[^0-9-]", "", text)
    if digits in ("", "-"):
        return None
    try:
        return int(digits)
    except ValueError:
        return None


def get_meta_from_slug(slug):
    tour = "atp" if "atp" in slug else "wta"
    category = "doubles" if "doubles" in slug else "singles"
    return tour, category


def persist_official_rankings(conn, source_slug, rows):
    if conn is None:
        return
    table_ref = sql.Identifier(DB_SCHEMA, "official_rankings")
    tour, category = get_meta_from_slug(source_slug)
    payload = []
    fetched_at = datetime.datetime.utcnow()
    for row in rows:
        payload.append(
            (
                source_slug,
                tour,
                category,
                row.get("rank"),
                to_int(row.get("rank")),
                row.get("player"),
                to_int(row.get("age")),
                row.get("country"),
                row.get("points"),
                to_int(row.get("points")),
                row.get("career_high"),
                row.get("change"),
                fetched_at,
            )
        )

    with conn.cursor() as cur:
        cur.execute(
            sql.SQL("DELETE FROM {} WHERE source_slug = %s").format(table_ref),
            (source_slug,),
        )
        if payload:
            insert_query = sql.SQL(
                """
                INSERT INTO {} (
                    source_slug,
                    tour,
                    category,
                    rank_text,
                    rank_value,
                    player,
                    age,
                    country,
                    points_text,
                    points_value,
                    career_high,
                    change_text,
                    fetched_at
                ) VALUES %s
                """
            ).format(table_ref)
            execute_values(
                cur,
                insert_query.as_string(cur),
                payload,
            )
    conn.commit()

# URL to scrape


def fetch_ranking(url):
    print(f"fetching {url}")
    global xpath
    source_slug = url.split("/")[len(url.split("/")) - 1]
    file_name = source_slug
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
    print(f"data fetched {len(rows)}...")
    data = []
    i=0
    print("processing data....")
    for row in rows:
        if i >= RECORD_LIMIT:
            break
        cells = row.find_elements(By.TAG_NAME, "td")

        if len(cells) >= 6:  # Ensure row has enough columns
            if "live" in file_name:
                age, career_high, change, country, player, points, rank = live_ranking(cells)
            else:
                age, career_high, change, country, player, points, rank = official_ranking(cells)

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
    with open(file_name, "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

    persist_official_rankings(db_conn, source_slug, data)
    if db_conn is not None:
        print(f"updated DB rows for {source_slug}: {len(data)}")

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


urls = ["official-atp-ranking","official-atp-doubles-ranking","official-wta-ranking","official-wta-doubles-ranking"]
db_conn = None
if DATABASE_URL:
    try:
        db_conn = psycopg2.connect(DATABASE_URL)
        print(f"PostgreSQL connected. Using existing official_rankings table. Limit={RECORD_LIMIT}")
    except Exception as e:
        db_conn = None
        print(f"PostgreSQL connection failed: {e}")
else:
    print("DATABASE_URL not set. Skipping DB update and only writing JSON files.")

obj_timestamp = {}
for url in urls:
    driver = webdriver.Chrome(service=service, options=options)
    print(f"fetching ranking {url}")
    fetch_ranking(f"https://live-tennis.eu/en/{url}")
    obj_timestamp[url]=datetime.datetime.now().strftime("%d-%m-%Y %I:%M %p")
    # Close the driver
    driver.close()
    driver.quit()
file_timestamp="ranking/official/official_ranking_timestamp.json"
with open(file_timestamp, "w", encoding="utf-8") as json_file:
    json.dump(obj_timestamp, json_file, ensure_ascii=False, indent=4)

if db_conn is not None:
    db_conn.close()
