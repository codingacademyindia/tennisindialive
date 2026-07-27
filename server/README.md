Server options

This folder now supports two server options:

1. Node/Express (`server.js`) for existing tweet/static flow.
2. Python/FastAPI (`main.py`) for PostgreSQL fetch APIs and RapidAPI proxy.

FastAPI setup (recommended for DB + proxy)

1. Create/update `server/.env` using `server/.env.example`:
- `DATABASE_URL` should be your Neon URL.
- `REACT_APP_RAPIDAPI_KEY` should be your RapidAPI key.

2. Install Python dependencies:

```bash
cd server
python -m pip install -r requirements.txt
```

3. Run FastAPI proxy on port 3224:

```bash
cd server
python -m uvicorn main:app --host 0.0.0.0 --port 3224 --reload
```

Available FastAPI endpoints

- `GET /health` - app health.
- `GET /db/ping` - verifies DB connectivity.
- `GET /db/tables` - lists public tables.
- `GET /db/{table_name}?limit=50` - fetches rows from a table.
- `ANY /proxy/{path}` - proxies requests to `https://tennisapi1.p.rapidapi.com/{path}`.

Examples

```bash
curl http://localhost:3224/health
curl http://localhost:3224/db/ping
curl "http://localhost:3224/db/players?limit=20"
curl "http://localhost:3224/proxy/api/tennis/match/123"
```
