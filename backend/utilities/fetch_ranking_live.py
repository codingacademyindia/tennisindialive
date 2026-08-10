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
    tour = "atp" if slug.startswith("atp") else "wta"
    category = "doubles" if "doubles" in slug else "singles"
    return tour, category


db_conn = None


def ensure_connection():
    """Return a live DB connection, reconnecting if idle/closed (cloud Postgres drops idle links during long Selenium scrapes)."""
    global db_conn
    if not DATABASE_URL:
        return None
    if db_conn is not None and not db_conn.closed:
        try:
            with db_conn.cursor() as cur:
                cur.execute("SELECT 1")
            return db_conn
        except Exception:
            try:
                db_conn.close()
            except Exception:
                pass
            db_conn = None
    try:
        db_conn = psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"PostgreSQL connection failed: {e}")
        db_conn = None
    return db_conn


def persist_live_rankings(source_slug, rows):
    if not DATABASE_URL:
        return
    table_ref = sql.Identifier(DB_SCHEMA, "live_rankings")
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

    for attempt in range(2):
        conn = ensure_connection()
        if conn is None:
            print(f"Skipping DB persist for {source_slug}: no connection")
            return
        try:
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
            return
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as e:
            print(f"DB connection dropped while persisting {source_slug}, retrying: {e}")
            global db_conn
            try:
                db_conn.close()
            except Exception:
                pass
            db_conn = None
            if attempt == 1:
                print(f"Failed to persist {source_slug} after retry: {e}")

# URL to scrape


def fetch_ranking(url):
    print(f"fetching {url}")
    global xpath
    source_slug = url.split("/")[len(url.split("/")) - 1]
    driver.get(url)
    # Wait for elements to load (optional)
    time.sleep(3)
    # Find all elements matching the XPath
    xpath = "//div[@id='plyrRankings']/table/tbody//tr"
    rows = driver.find_elements(By.XPATH, xpath)
    # Extract all <td> contents inside each <tr>
    print(f"data fetched {len(rows)}...")
    data = []
    i=0
    print("processing data....")
    for row in rows:
        if i >= RECORD_LIMIT:
            break
        cells = row.find_elements(By.TAG_NAME, "td")

        if len(cells) >= 6:  # Ensure row has enough columns
            if "live" in source_slug:
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

    print(f"data processed {len(data)}")

    persist_live_rankings(source_slug, data)
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


urls = ["atp-live-ranking","atp-doubles-live-ranking","wta-live-ranking","wta-doubles-live-ranking"]
if DATABASE_URL:
    if ensure_connection() is not None:
        print(f"PostgreSQL connected. Using existing live_rankings table. Limit={RECORD_LIMIT}")
else:
    print("DATABASE_URL not set. Rankings will not be persisted.")

obj_timestamp = {}
for url in urls:
    driver = webdriver.Chrome(service=service, options=options)
    print(f"fetching ranking {url}")
    fetch_ranking(f"https://live-tennis.eu/en/{url}")
    obj_timestamp[url]=datetime.datetime.now().strftime("%d-%m-%Y %I:%M %p")
    # Close the driver
    driver.close()
    driver.quit()

if db_conn is not None:
    db_conn.close()
