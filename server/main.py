from __future__ import annotations

import os
import re
import json
import asyncio
import calendar
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Optional

import httpx
import tweepy
from dotenv import load_dotenv
from fastapi import Body, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from psycopg import sql
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool


load_dotenv(Path(__file__).resolve().parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "")
RAPIDAPI_KEY = os.getenv("REACT_APP_RAPIDAPI_KEY", "")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "tennisapi1.p.rapidapi.com")
RAPIDAPI_BASE_URL = os.getenv("RAPIDAPI_BASE_URL", "https://tennisapi1.p.rapidapi.com")

_TABLE_NAME_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
db_pool: Optional[AsyncConnectionPool] = None
http_client: Optional[httpx.AsyncClient] = None
PROJECT_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_BUILD_DIR = PROJECT_ROOT / "build"
FRONTEND_INDEX_FILE = FRONTEND_BUILD_DIR / "index.html"


@asynccontextmanager
async def lifespan(_: FastAPI):
    global db_pool, http_client
    if DATABASE_URL:
        db_pool = AsyncConnectionPool(
            conninfo=DATABASE_URL,
            open=False,
            kwargs={"autocommit": True},
            check=AsyncConnectionPool.check_connection,
            max_idle=180,
        )
        await db_pool.open()
    # Reused across requests instead of opening a new client (and connection pool) per proxy call.
    http_client = httpx.AsyncClient(
        timeout=30.0,
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=10),
    )
    try:
        yield
    finally:
        if db_pool is not None:
            await db_pool.close()
        if http_client is not None:
            await http_client.aclose()


app = FastAPI(title="TennisIndia FastAPI Proxy", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_pool() -> AsyncConnectionPool:
    if db_pool is None:
        raise HTTPException(
            status_code=500,
            detail="Database is not configured. Set DATABASE_URL in server/.env",
        )
    return db_pool


def _parse_maybe_number(value: Any) -> Optional[int]:
    if value is None:
        return None
    raw = str(value).strip()
    if not raw:
        return None
    parsed = re.sub(r"[^0-9-]", "", raw)
    if not parsed:
        return None
    try:
        return int(parsed)
    except ValueError:
        return None


def _normalize_ranking_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized_rows: list[dict[str, Any]] = []
    for row in rows:
        rank_text = row.get("ranking") or row.get("rank")
        points_text = row.get("points") or row.get("point")

        team = row.get("team") if isinstance(row.get("team"), dict) else {}
        team_country = team.get("country") if isinstance(team.get("country"), dict) else {}
        player_dict = row.get("player") if isinstance(row.get("player"), dict) else {}
        country_dict = row.get("country") if isinstance(row.get("country"), dict) else {}

        player_name = team.get("name") or player_dict.get("name") or row.get("player") or row.get("name") or ""
        country_code = team_country.get("alpha3") or country_dict.get("alpha3") or row.get("country")

        normalized_rows.append(
            {
                "rank_text": rank_text,
                "rank_value": _parse_maybe_number(rank_text),
                "player": player_name,
                "country": country_code,
                "points_text": points_text,
                "points_value": _parse_maybe_number(points_text),
                "career_high": row.get("bestRanking") or row.get("careerHigh"),
                "change_text": row.get("change") or row.get("delta") or row.get("trend"),
            }
        )

    return normalized_rows


async def _proxy_to_rapidapi(full_path: str, request: Request) -> Response:
    if not RAPIDAPI_KEY:
        raise HTTPException(
            status_code=500,
            detail="Missing REACT_APP_RAPIDAPI_KEY in server/.env",
        )

    target_url = f"{RAPIDAPI_BASE_URL.rstrip('/')}/{full_path.lstrip('/')}"
    request_body = await request.body()

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }

    content_type = request.headers.get("content-type")
    if content_type:
        headers["content-type"] = content_type

    if http_client is None:
        raise HTTPException(status_code=500, detail="HTTP client is not initialized")

    upstream_response = await http_client.request(
        method=request.method,
        url=target_url,
        params=dict(request.query_params),
        headers=headers,
        content=request_body,
    )

    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        media_type=upstream_response.headers.get("content-type"),
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/tweet/live")
async def tweet_live(payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
    msg = payload.get("msg")
    env = payload.get("env", "test")

    if not msg:
        raise HTTPException(status_code=400, detail="msg is required")

    prefix = "PROD" if env == "prod" else "TEST"
    app_key = os.getenv(f"{prefix}_CONSUMER_KEY")
    app_secret = os.getenv(f"{prefix}_CONSUMER_SECRET")
    access_token = os.getenv(f"{prefix}_ACCESS_TOKEN")
    access_secret = os.getenv(f"{prefix}_ACCESS_SECRET")

    try:
        client = tweepy.Client(
            consumer_key=app_key,
            consumer_secret=app_secret,
            access_token=access_token,
            access_token_secret=access_secret,
        )
        result = client.create_tweet(text=msg)
        tweet_id = result.data["id"]
        return {"success": True, "tweetId": tweet_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Tweet error: {exc}") from exc


@app.get("/db/ping")
async def db_ping() -> dict[str, Any]:
    pool = _require_pool()
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT NOW() AS now")
            row = await cur.fetchone()
            return {"status": "ok", "db_time": row["now"] if row else None}


@app.get("/db/tables")
async def list_public_tables() -> dict[str, list[str]]:
    pool = _require_pool()
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
                """
            )
            rows = await cur.fetchall()
            return {"tables": [row[0] for row in rows]}


@app.get("/db/{table_name}")
async def fetch_rows(
    table_name: str,
    limit: int = Query(default=50, ge=1, le=200),
) -> dict[str, Any]:
    if not _TABLE_NAME_RE.match(table_name):
        raise HTTPException(status_code=400, detail="Invalid table name")

    pool = _require_pool()
    query = sql.SQL("SELECT * FROM {} LIMIT %s").format(sql.Identifier(table_name))

    try:
        async with pool.connection() as conn:
            async with conn.cursor(row_factory=dict_row) as cur:
                await cur.execute(query, (limit,))
                rows = await cur.fetchall()
                return {"table": table_name, "count": len(rows), "rows": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch rows: {exc}") from exc


@app.get("/api/live-rankings")
async def get_live_rankings(
    source_slug: Optional[str] = Query(default=None),
    tour: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    player: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    pool = _require_pool()

    where_parts: list[sql.Composed] = []
    params: list[Any] = []

    if source_slug:
        where_parts.append(sql.SQL("source_slug = %s"))
        params.append(source_slug)
    if tour:
        where_parts.append(sql.SQL("tour = %s"))
        params.append(tour)
    if category:
        where_parts.append(sql.SQL("category = %s"))
        params.append(category)
    if player:
        where_parts.append(sql.SQL("player ILIKE %s"))
        params.append(f"%{player}%")

    query = sql.SQL(
        """
        SELECT
            id,
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
        FROM tennisdb.live_rankings
        """
    )

    if where_parts:
        query += sql.SQL(" WHERE ") + sql.SQL(" AND ").join(where_parts)

    query += sql.SQL(
        """
        ORDER BY fetched_at DESC, rank_value ASC NULLS LAST, id DESC
        LIMIT %s OFFSET %s
        """
    )
    params.extend([limit, offset])

    count_query = sql.SQL("SELECT COUNT(*) AS total FROM tennisdb.live_rankings")
    if where_parts:
        count_query += sql.SQL(" WHERE ") + sql.SQL(" AND ").join(where_parts)

    try:
        async with pool.connection() as conn:
            async with conn.cursor(row_factory=dict_row) as cur:
                await cur.execute(query, params)
                rows = await cur.fetchall()

                await cur.execute(count_query, params[:-2])
                total_row = await cur.fetchone()

                return {
                    "filters": {
                        "source_slug": source_slug,
                        "tour": tour,
                        "category": category,
                        "player": player,
                    },
                    "pagination": {
                        "limit": limit,
                        "offset": offset,
                        "returned": len(rows),
                        "total": int(total_row["total"]) if total_row else 0,
                    },
                    "rows": rows,
                }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch live rankings: {exc}") from exc


@app.get("/api/live-rankings/latest")
async def get_latest_live_rankings_snapshot(
    source_slug: Optional[str] = Query(default=None),
    tour: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    limit: int = Query(default=200, ge=1, le=1000),
) -> dict[str, Any]:
    pool = _require_pool()

    latest_where_parts: list[sql.Composed] = []
    latest_params: list[Any] = []

    if source_slug:
        latest_where_parts.append(sql.SQL("source_slug = %s"))
        latest_params.append(source_slug)
    if tour:
        latest_where_parts.append(sql.SQL("tour = %s"))
        latest_params.append(tour)
    if category:
        latest_where_parts.append(sql.SQL("category = %s"))
        latest_params.append(category)

    latest_ts_query = sql.SQL("SELECT MAX(fetched_at) AS max_fetched_at FROM tennisdb.live_rankings")
    if latest_where_parts:
        latest_ts_query += sql.SQL(" WHERE ") + sql.SQL(" AND ").join(latest_where_parts)

    rows_query = sql.SQL(
        """
        SELECT
            id,
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
        FROM tennisdb.live_rankings
        WHERE fetched_at = %s
        """
    )

    if latest_where_parts:
        rows_query += sql.SQL(" AND ") + sql.SQL(" AND ").join(latest_where_parts)

    rows_query += sql.SQL(" ORDER BY rank_value ASC NULLS LAST, id ASC LIMIT %s")

    try:
        async with pool.connection() as conn:
            async with conn.cursor(row_factory=dict_row) as cur:
                await cur.execute(latest_ts_query, latest_params)
                latest_row = await cur.fetchone()
                latest_ts = latest_row["max_fetched_at"] if latest_row else None

                if latest_ts is None:
                    return {
                        "fetched_at": None,
                        "count": 0,
                        "rows": [],
                    }

                rows_params = [latest_ts, *latest_params, limit]
                await cur.execute(rows_query, rows_params)
                rows = await cur.fetchall()

                return {
                    "fetched_at": latest_ts,
                    "count": len(rows),
                    "rows": rows,
                }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch latest snapshot: {exc}") from exc


_ATP_GRAND_SLAMS = {"australian-open", "roland-garros", "wimbledon", "us-open"}
_ATP_MASTERS_1000 = {
    "indian-wells", "miami", "monte-carlo", "madrid", "rome",
    "montreal", "toronto", "cincinnati", "shanghai", "paris",
}
_ATP_500 = {
    "rotterdam", "rio-de-janeiro", "dubai", "acapulco", "barcelona",
    "halle", "london", "washington", "hamburg", "beijing", "tokyo",
    "vienna", "basel",
}
_ATP_TEAM_EVENTS = {
    "davis-cup-finals": "Davis Cup",
    "davis-cup-qualifiers-1st-rd": "Davis Cup",
    "davis-cup-qualifiers-2nd-rd": "Davis Cup",
    "perth-sydney": "United Cup",
    "laver-cup": "Laver Cup",
    "nitto-atp-finals": "ATP Finals",
}


def _categorize_atp_tournament(slug: str) -> str:
    normalized = (slug or "").strip().lower()

    if normalized in _ATP_TEAM_EVENTS:
        return _ATP_TEAM_EVENTS[normalized]
    if normalized in _ATP_GRAND_SLAMS:
        return "Grand Slam"
    if normalized in _ATP_MASTERS_1000:
        return "Masters 1000"
    if normalized in _ATP_500:
        return "ATP 500"
    return "ATP 250"


_ATP_CATEGORY_RANK = {
    "Grand Slam": 0,
    "ATP Finals": 1,
    "Masters 1000": 2,
    "ATP 500": 3,
    "ATP 250": 4,
    "United Cup": 5,
    "Davis Cup": 6,
    "Laver Cup": 6,
}

_WTA_CATEGORY_RANK = {
    "Grand Slam": 0,
    "WTA Finals": 1,
    "WTA 1000": 2,
    "WTA 500": 3,
    "WTA 250": 4,
    "WTA 125": 5,
    "WTA Tour": 6,
}


def _category_rank(category: str) -> int:
    return _ATP_CATEGORY_RANK.get(category, _WTA_CATEGORY_RANK.get(category, 9))


def _categorize_tournament(tour_type: str, slug: str, points: Any) -> str:
    normalized_tour = (tour_type or "").strip().lower()

    if normalized_tour == "atp":
        return _categorize_atp_tournament(slug)

    if normalized_tour == "wta":
        points_value = _parse_maybe_number(points)
        if points_value is not None:
            if points_value >= 1800:
                return "Grand Slam"
            if points_value >= 1400:
                return "WTA Finals"
            if points_value >= 1000:
                return "WTA 1000"
            if points_value >= 500:
                return "WTA 500"
            if points_value >= 250:
                return "WTA 250"
            if points_value >= 125:
                return "WTA 125"
        return "WTA Tour"

    return normalized_tour.upper() if normalized_tour else "Tour"


@app.get("/api/tournaments")
@app.get("/api/atp-tournaments")
async def get_atp_tournaments(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    tour_type: Optional[str] = Query(default="atp"),
    year: Optional[str] = Query(default=None),
    month: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
) -> dict[str, Any]:
    pool = _require_pool()

    where_sql_parts: list[str] = []
    params: list[Any] = []

    tour_type_raw = (tour_type or "").strip()
    year_raw = (year or "").strip()
    month_raw = (month or "").strip()
    search_raw = (search or "").strip()

    if tour_type_raw:
        params.append(tour_type_raw)
        where_sql_parts.append("LOWER(tour_type) = LOWER(%s)")

    if re.fullmatch(r"\d{4}", year_raw):
        params.append(f"%{year_raw}%")
        params.append(int(year_raw))
        where_sql_parts.append("(date_text ILIKE %s OR EXTRACT(YEAR FROM fetched_at) = %s)")

    if re.fullmatch(r"(?:[1-9]|1[0-2])", month_raw):
        month_num = int(month_raw)
        month_name = calendar.month_name[month_num]
        month_abbr = calendar.month_abbr[month_num]
        params.append(f"%{month_name}%")
        params.append(f"%{month_abbr}%")
        where_sql_parts.append("(date_text ILIKE %s OR date_text ILIKE %s)")

    if search_raw:
        params.append(f"%{search_raw}%")
        where_sql_parts.append("(title_text ILIKE %s OR full_text ILIKE %s OR event_slug ILIKE %s)")
        params.extend([params[-1], params[-1]])

    where_sql = f"WHERE {' AND '.join(where_sql_parts)}" if where_sql_parts else ""

    count_query = f"""
        SELECT COUNT(*)::int AS total
        FROM tennisdb.tournaments
        {where_sql}
    """

    list_params = [*params, limit, offset]
    list_query = f"""
        SELECT
            id,
            event_slug,
            event_id,
            title_text,
            date_text,
            full_text,
            points,
            tour_type,
            overview_url,
            source_url,
            fetched_at
        FROM tennisdb.tournaments
        {where_sql}
        ORDER BY fetched_at DESC, id ASC
        LIMIT %s OFFSET %s
    """

    for attempt in range(3):
        try:
            async with pool.connection() as conn:
                async with conn.cursor(row_factory=dict_row) as cur:
                    await cur.execute(count_query, params)
                    count_row = await cur.fetchone()

                    await cur.execute(list_query, list_params)
                    rows = await cur.fetchall()

                    total = int(count_row["total"]) if count_row else 0
                    returned = len(rows)

                    for row in rows:
                        category = _categorize_tournament(
                            row.get("tour_type", ""),
                            row.get("event_slug", ""),
                            row.get("points"),
                        )
                        row["category"] = category
                        row["category_rank"] = _category_rank(category)

                    return {
                        "pagination": {
                            "limit": limit,
                            "offset": offset,
                            "total": total,
                            "returned": returned,
                        },
                        "rows": rows,
                    }
        except Exception as exc:
            err_text = str(exc).lower()
            transient_disconnect = (
                "terminating connection due to administrator command" in err_text
                or "consuming input failed" in err_text
                or "connection abort" in err_text
                or "ssl syscall error" in err_text
                or "server closed the connection" in err_text
            )

            if transient_disconnect and attempt < 2:
                await asyncio.sleep(0.3 * (attempt + 1))
                continue

            raise HTTPException(status_code=500, detail=f"Failed to load ATP tournaments: {exc}") from exc


@app.api_route(
    "/api/tennis/{full_path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def tennis_api_compat_proxy(full_path: str, request: Request) -> Response:
    return await _proxy_to_rapidapi(f"api/tennis/{full_path}", request)


async def _fetch_latest_ranking_snapshot(
    table_name: str, tour: str, category: str, limit: int
) -> dict[str, Any]:
    pool = _require_pool()
    table_ident = sql.Identifier("tennisdb", table_name)

    latest_ts_query = sql.SQL(
        "SELECT MAX(fetched_at) AS max_fetched_at FROM {} WHERE tour = %s AND category = %s"
    ).format(table_ident)
    rows_query = sql.SQL(
        """
        SELECT
            rank_text, rank_value, player, country,
            points_text, points_value, career_high, change_text, fetched_at
        FROM {}
        WHERE fetched_at = %s AND tour = %s AND category = %s
        ORDER BY rank_value ASC NULLS LAST, id ASC
        LIMIT %s
        """
    ).format(table_ident)

    try:
        async with pool.connection() as conn:
            async with conn.cursor(row_factory=dict_row) as cur:
                await cur.execute(latest_ts_query, [tour, category])
                latest_row = await cur.fetchone()
                latest_ts = latest_row["max_fetched_at"] if latest_row else None

                if latest_ts is None:
                    return {"fetched_at": None, "count": 0, "rows": []}

                await cur.execute(rows_query, [latest_ts, tour, category, limit])
                rows = await cur.fetchall()

                return {
                    "fetched_at": latest_ts,
                    "count": len(rows),
                    "rows": rows,
                }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch rankings: {exc}") from exc


@app.get("/api/rankings/live/{tour}/{category}")
async def rankings_live_compat(
    tour: str,
    category: str,
    limit: int = Query(default=1000, ge=1, le=2000),
) -> dict[str, Any]:
    normalized_tour = str(tour or "").lower()
    normalized_category = str(category or "").lower()

    if normalized_tour not in {"atp", "wta"}:
        raise HTTPException(status_code=400, detail="tour must be atp or wta")
    if normalized_category not in {"singles", "doubles"}:
        raise HTTPException(status_code=400, detail="category must be singles or doubles")

    return await _fetch_latest_ranking_snapshot("live_rankings", normalized_tour, normalized_category, limit)


@app.get("/api/rankings/official/{tour}/{category}")
async def rankings_official_compat(
    tour: str,
    category: str,
    limit: int = Query(default=1000, ge=1, le=2000),
) -> dict[str, Any]:
    normalized_tour = str(tour or "").lower()
    normalized_category = str(category or "").lower()

    if normalized_tour not in {"atp", "wta"}:
        raise HTTPException(status_code=400, detail="tour must be atp or wta")
    if normalized_category not in {"singles", "doubles"}:
        raise HTTPException(status_code=400, detail="category must be singles or doubles")

    return await _fetch_latest_ranking_snapshot("official_rankings", normalized_tour, normalized_category, limit)


@app.api_route(
    "/proxy/{full_path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def rapidapi_proxy(full_path: str, request: Request) -> Response:
    return await _proxy_to_rapidapi(full_path, request)


@app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_frontend(full_path: str) -> FileResponse:
    # Keep unknown API-like paths as 404s instead of serving the SPA shell.
    if full_path.startswith(("api/", "db/", "proxy/")):
        raise HTTPException(status_code=404, detail="Not Found")

    if full_path and FRONTEND_BUILD_DIR.exists():
        requested_file = (FRONTEND_BUILD_DIR / full_path).resolve(strict=False)
        build_root = FRONTEND_BUILD_DIR.resolve(strict=False)
        try:
            requested_file.relative_to(build_root)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail="Not Found") from exc

        if requested_file.is_file():
            return FileResponse(requested_file)

    if FRONTEND_INDEX_FILE.exists():
        return FileResponse(FRONTEND_INDEX_FILE)

    raise HTTPException(
        status_code=404,
        detail="Frontend build not found. Run `npm run build` at repository root.",
    )


@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_frontend_root() -> FileResponse:
    return await serve_frontend("")