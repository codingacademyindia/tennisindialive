import datetime
import json
import logging
import os
import re
import time
from urllib.parse import urlparse

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
WTA_TOURNAMENTS_TABLE = os.getenv("WTA_TOURNAMENTS_TABLE", os.getenv("TOURNAMENTS_TABLE", "tournaments"))
WTA_TOURNAMENTS_URL = os.getenv("WTA_TOURNAMENTS_URL", "https://www.wtatennis.com/tournaments")
RECORD_LIMIT_RAW = os.getenv("RECORD_LIMIT", "")
OUTPUT_JSON_PATH = os.getenv("WTA_TOURNAMENTS_JSON_PATH", "ranking/live/wta/wta-tournaments.json")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("fetch_tournaments_wta")


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


def build_url(href):
    if href.startswith("http"):
        return href
    if href.startswith("//"):
        return f"https:{href}"
    return f"https://www.wtatennis.com{href}"


def parse_href_parts(href):
    path_parts = [p for p in urlparse(href).path.strip("/").split("/") if p]
    # Expected examples:
    # /tournaments/1175/athens/2026
    # /tournaments/us-open
    if len(path_parts) < 2 or path_parts[0] != "tournaments":
        return None, None

    if path_parts[1].isdigit():
        event_id = path_parts[1]
        event_slug = path_parts[2] if len(path_parts) > 2 else None
    else:
        event_id = None
        event_slug = path_parts[1]
    return event_slug, event_id


def parse_points_from_context(anchor, context_text):
    badge_src = anchor.xpath(
        "ancestor::*[.//img[contains(@src, '-tag.svg')] and .//a[contains(@href, '/tournaments/')]][1]"
        "//img[contains(@src, '-tag.svg')][1]/@src"
    )
    if badge_src:
        src = badge_src[0].lower()
        badge_map = {
            "125k-tag": 125,
            "250k-tag": 250,
            "500k-tag": 500,
            "1000k-tag": 1000,
            "gs-tag": 2000,
            "finals-tag": 1500,
        }
        for key, value in badge_map.items():
            if key in src:
                return value

    text = context_text.upper()
    match = re.search(r"\bWTA\s*(125|250|500|1000)\b", text)
    if match:
        return int(match.group(1))
    if "GRAND SLAM" in text:
        return 2000
    if "FINALS" in text:
        return 1500
    return None


def parse_date_from_context(context_text):
    text = normalize_ws(context_text.upper())
    patterns = [
        r"\b\d{1,2}\s*[A-Z]{3}\s*-\s*\d{1,2}\s*[A-Z]{3}\b",
        r"\b\d{1,2}[A-Z]{3}\s*-\s*\d{1,2}[A-Z]{3}\b",
        r"\b\d{1,2}\s*-\s*\d{1,2}\s*[A-Z]{3}\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return normalize_ws(match.group(0))
    return ""


def fetch_tournaments(url, limit):
    logger.info("Starting WTA tournament fetch url=%s limit=%s", url, "ALL" if limit is None else limit)
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
        time.sleep(5)
        logger.info("WTA page opened title=%s", driver.title)

        # WTA calendar lazy-loads additional cards while scrolling.
        stable_rounds = 0
        prev_height = 0
        scroll_steps = 0
        while stable_rounds < 3:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1.8)
            curr_height = driver.execute_script("return document.body.scrollHeight")
            scroll_steps += 1
            logger.debug("Scroll step=%s prev_height=%s curr_height=%s stable_rounds=%s", scroll_steps, prev_height, curr_height, stable_rounds)
            if curr_height == prev_height:
                stable_rounds += 1
            else:
                stable_rounds = 0
                prev_height = curr_height

        driver.execute_script("window.scrollTo(0, 0);")
        page_source = driver.page_source
        logger.info("Collected page source chars=%s scroll_steps=%s", len(page_source), scroll_steps)
        tree = html.fromstring(page_source)
    finally:
        driver.quit()

    anchors = tree.xpath("//main//a[contains(@href, '/tournaments/')]")
    if not anchors:
        logger.warning("No anchors found under //main. Falling back to global tournament anchors.")
        anchors = tree.xpath("//a[contains(@href, '/tournaments/')]")
    logger.info("Raw tournament anchors found=%s", len(anchors))

    data = []
    seen = set()
    fetched_at = datetime.datetime.utcnow().isoformat()
    skip_counts = {
        "empty_href": 0,
        "filtered_path": 0,
        "duplicate": 0,
        "empty_title": 0,
        "short_or_nav": 0,
        "invalid_path": 0,
    }

    for anchor in anchors:
        href = (anchor.get("href") or "").strip()
        if not href:
            skip_counts["empty_href"] += 1
            continue

        url_path = urlparse(href).path.lower()
        if url_path in ("/tournaments", "/tournaments/", "/tournaments/wta-125", "/tournaments/wta-125/"):
            skip_counts["filtered_path"] += 1
            continue
        if "/tickets" in url_path:
            skip_counts["filtered_path"] += 1
            continue

        abs_url = build_url(href)
        if abs_url in seen:
            skip_counts["duplicate"] += 1
            continue

        title_text = normalize_ws(" ".join(anchor.xpath(".//text()")))
        if not title_text:
            skip_counts["empty_title"] += 1
            continue

        context_node = anchor.xpath(
            "ancestor::*[.//img[contains(@src, '-tag.svg')] and .//a[contains(@href, '/tournaments/')]][1]"
        )
        if context_node:
            context_text = normalize_ws(" ".join(context_node[0].xpath(".//text()")))
        else:
            context_text = title_text

        # Keep only actual tournament entries, avoid generic nav links.
        if len(title_text) < 4:
            skip_counts["short_or_nav"] += 1
            continue
        if "TOUR CALENDAR" in title_text.upper():
            skip_counts["short_or_nav"] += 1
            continue

        event_slug, event_id = parse_href_parts(abs_url)
        if event_slug is None and event_id is None:
            skip_counts["invalid_path"] += 1
            continue

        row = {
            "event_slug": event_slug,
            "event_id": event_id,
            "points": parse_points_from_context(anchor, context_text),
            "title_text": title_text,
            "date_text": parse_date_from_context(context_text),
            "full_text": context_text,
            "overview_url": abs_url,
            "source_url": url,
            "fetched_at": fetched_at,
        }

        data.append(row)
        seen.add(abs_url)

        if len(data) <= 5:
            logger.debug(
                "Accepted row #%s title=%s event_id=%s points=%s url=%s",
                len(data),
                row["title_text"],
                row["event_id"],
                row["points"],
                row["overview_url"],
            )

        if limit is not None and len(data) >= limit:
            break

    logger.info("Accepted tournament rows=%s", len(data))
    logger.info("Filter counters=%s", skip_counts)
    if not data:
        sample_links = [normalize_ws((a.get("href") or "")) for a in anchors[:10]]
        logger.warning("No rows accepted. Sample hrefs=%s", sample_links)

    return data


def save_json(rows):
    folder = os.path.dirname(OUTPUT_JSON_PATH)
    if folder:
        os.makedirs(folder, exist_ok=True)
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as json_file:
        json.dump(rows, json_file, ensure_ascii=False, indent=4)
    logger.info("JSON updated path=%s rows=%s", OUTPUT_JSON_PATH, len(rows))


def persist_tournaments(conn, rows):
    if conn is None or not rows:
        if conn is None:
            logger.warning("DB connection is None. Skipping DB write.")
        else:
            logger.warning("No rows available for DB write. Skipping DB write.")
        return

    table_ref = sql.Identifier(DB_SCHEMA, WTA_TOURNAMENTS_TABLE)
    tour_type = "WTA"
    logger.info("Writing rows to %s.%s for tour_type=%s", DB_SCHEMA, WTA_TOURNAMENTS_TABLE, tour_type)
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
                (WTA_TOURNAMENTS_URL, tour_type),
            )
            deleted_rows = cur.rowcount
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
            logger.info("DB delete_count=%s insert_count=%s", deleted_rows, len(payload))
        except psycopg2.errors.UndefinedTable as exc:
            conn.rollback()
            raise RuntimeError(
                f"Target table {DB_SCHEMA}.{WTA_TOURNAMENTS_TABLE} does not exist. "
                f"Create it first or update WTA_TOURNAMENTS_TABLE in .env."
            ) from exc
    conn.commit()
    logger.info("DB commit complete")


def main():
    limit = parse_limit(RECORD_LIMIT_RAW)
    logger.info(
        "Configuration schema=%s table=%s record_limit=%s source=%s",
        DB_SCHEMA,
        WTA_TOURNAMENTS_TABLE,
        "ALL" if limit is None else limit,
        WTA_TOURNAMENTS_URL,
    )
    rows = fetch_tournaments(WTA_TOURNAMENTS_URL, limit)
    logger.info("Fetched WTA tournaments=%s", len(rows))
    save_json(rows)

    if not DATABASE_URL:
        logger.warning("DATABASE_URL not set. Skipping DB update.")
        return

    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        logger.info("PostgreSQL connection established")
        persist_tournaments(conn, rows)
        logger.info("Updated DB rows in %s.%s: %s", DB_SCHEMA, WTA_TOURNAMENTS_TABLE, len(rows))
    finally:
        if conn is not None:
            conn.close()
            logger.info("PostgreSQL connection closed")


if __name__ == "__main__":
    main()
