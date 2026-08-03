import datetime
import json
import os
import re
import time

import psycopg2
from dotenv import load_dotenv
from lxml import html
from psycopg2 import sql
from psycopg2.extras import execute_values
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
DB_SCHEMA = os.getenv("DB_SCHEMA", "public")
TOURNAMENTS_TABLE = os.getenv("TOURNAMENTS_TABLE", "tournaments")
TOURNAMENTS_URL = os.getenv("TOURNAMENTS_URL", "https://www.atptour.com/en/tournaments")
RECORD_LIMIT_RAW = os.getenv("RECORD_LIMIT", "")
OUTPUT_JSON_PATH = os.getenv("TOURNAMENTS_JSON_PATH", "ranking/live/atp/atp-tournaments.json")


def parse_limit(raw_value):
    text = (raw_value or "").strip().lower()
    if text in ("", "all", "none", "0"):
        return None
    try:
        value = int(text)
        return value if value > 0 else None
    except ValueError:
        return None


def normalize_ws(value):
    return re.sub(r"\s+", " ", value or "").strip()


def parse_href_parts(href):
    # Expected: /en/tournaments/{slug}/{event_id}/overview
    parts = [p for p in href.strip("/").split("/") if p]
    if len(parts) >= 5:
        return parts[2], parts[3]
    return None, None


def build_overview_url(href):
    if href.startswith("http"):
        return href
    return f"https://www.atptour.com{href}"


def parse_anchor_text(raw_text):
    text = normalize_ws(raw_text)
    left = text
    date_text = ""
    if "|" in text:
        left, date_text = [normalize_ws(x) for x in text.split("|", 1)]
    return left, date_text, text


def parse_points_from_badge(anchor):
    badge_src = anchor.xpath(
        "ancestor::div[.//img[contains(@src, 'categorystamps_')]][1]//img[contains(@src, 'categorystamps_')][1]/@src"
    )
    if not badge_src:
        return None

    badge_name = badge_src[0].lower()
    match = re.search(r"categorystamps_(\d+)", badge_name)
    if match:
        return int(match.group(1))

    special_points = {
        "grandslam": 2000,
        "finals": 1500,
        "lvr": None,
        "itf": None,
    }
    for key, value in special_points.items():
        if key in badge_name:
            return value
    return None


def fetch_tournaments(url, limit):
    options = Options()
    # options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    )

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    try:
        driver.get(url)
        time.sleep(6)
        tree = html.fromstring(driver.page_source)
    finally:
        driver.quit()

    anchors = tree.xpath("//a[contains(@href, '/en/tournaments/') and contains(@href, '/overview')]")

    data = []
    seen = set()
    fetched_at = datetime.datetime.utcnow().isoformat()
    for anchor in anchors:
        href = (anchor.get("href") or "").strip()
        if not href:
            continue
        if href in seen:
            continue
        seen.add(href)

        slug, event_id = parse_href_parts(href)
        title_text, date_text, full_text = parse_anchor_text(" ".join(anchor.xpath(".//text()")))
        if not full_text:
            continue

        data.append(
            {
                "event_slug": slug,
                "event_id": event_id,
                "points": parse_points_from_badge(anchor),
                "title_text": title_text,
                "date_text": date_text,
                "full_text": full_text,
                "overview_url": build_overview_url(href),
                "source_url": url,
                "fetched_at": fetched_at,
            }
        )

        if limit is not None and len(data) >= limit:
            break

    return data


def save_json(rows):
    folder = os.path.dirname(OUTPUT_JSON_PATH)
    if folder:
        os.makedirs(folder, exist_ok=True)
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as json_file:
        json.dump(rows, json_file, ensure_ascii=False, indent=4)


def persist_tournaments(conn, rows):
    if conn is None or not rows:
        return

    table_ref = sql.Identifier(DB_SCHEMA, TOURNAMENTS_TABLE)
    tour_type = "ATP"
    payload = []
    for row in rows:
        payload.append(
            (
                row["event_slug"],
                row["event_id"],
                row["points"],
                tour_type,
                row["title_text"],
                row["date_text"],
                row["full_text"],
                row["overview_url"],
                row["source_url"],
                row["fetched_at"],
            )
        )

    with conn.cursor() as cur:
        try:
            cur.execute(
                sql.SQL("DELETE FROM {} WHERE source_url = %s AND tour_type = %s").format(table_ref),
                (TOURNAMENTS_URL, tour_type),
            )
            insert_query = sql.SQL(
                """
                INSERT INTO {} (
                    event_slug,
                    event_id,
                    points,
                    tour_type,
                    title_text,
                    date_text,
                    full_text,
                    overview_url,
                    source_url,
                    fetched_at
                ) VALUES %s
                """
            ).format(table_ref)
            execute_values(cur, insert_query.as_string(cur), payload)
        except psycopg2.errors.UndefinedTable as exc:
            conn.rollback()
            raise RuntimeError(
                f"Target table {DB_SCHEMA}.{TOURNAMENTS_TABLE} does not exist. "
                f"Create it first or update TOURNAMENTS_TABLE in .env."
            ) from exc
    conn.commit()


def main():
    limit = parse_limit(RECORD_LIMIT_RAW)
    rows = fetch_tournaments(TOURNAMENTS_URL, limit)
    print(f"fetched tournaments: {len(rows)}")
    save_json(rows)
    print(f"updated json: {OUTPUT_JSON_PATH}")

    if not DATABASE_URL:
        print("DATABASE_URL not set. Skipping DB update.")
        return

    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        persist_tournaments(conn, rows)
        print(f"updated DB rows in {DB_SCHEMA}.{TOURNAMENTS_TABLE}: {len(rows)}")
    finally:
        if conn is not None:
            conn.close()


if __name__ == "__main__":
    main()
