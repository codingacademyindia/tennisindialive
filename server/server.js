require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises');
const { TwitterApi } = require('twitter-api-v2');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3224;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'tennisapi1.p.rapidapi.com';
const RAPIDAPI_BASE_URL = (process.env.RAPIDAPI_BASE_URL || `https://${RAPIDAPI_HOST}`).replace(/\/$/, '');

// Middleware
app.use(cors());
app.use(express.json());

const HEADERS = {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST
}

const dbPool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    })
  : null;

function buildRapidApiHeaders(contentType) {
  const headers = {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  };
  if (contentType) headers['content-type'] = contentType;
  return headers;
}

async function fetchRapidApiJson(apiPath, options = {}) {
  const url = `${RAPIDAPI_BASE_URL}${apiPath}`;
  const response = await fetch(url, {
    ...options,
    headers: buildRapidApiHeaders(options?.headers?.['content-type']),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `RapidAPI request failed (${response.status})`);
  }

  return response.json();
}

function parseMaybeNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseInt(String(value).replace(/[^0-9-]/g, ''), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeRankingRows(rows = []) {
  return rows.map((row) => ({
    rank_text: row?.ranking ?? row?.rank ?? null,
    rank_value: parseMaybeNumber(row?.ranking ?? row?.rank),
    player: row?.team?.name ?? row?.player?.name ?? row?.player ?? row?.name ?? '',
    country: row?.team?.country?.alpha3 ?? row?.country?.alpha3 ?? row?.country ?? null,
    points_text: row?.points ?? row?.point ?? null,
    points_value: parseMaybeNumber(row?.points ?? row?.point),
    career_high: row?.bestRanking ?? row?.careerHigh ?? null,
    change_text: row?.change ?? row?.delta ?? row?.trend ?? null,
  }));
}

async function getDoublesRankingsFromStaticFile(tour) {
  const filePath = path.join(__dirname, '..', 'public', 'ranking', 'live', tour, `${tour}-doubles-live-ranking.json`);
  const fileText = await fs.readFile(filePath, 'utf-8');
  const rows = JSON.parse(fileText);

  return rows.map((row) => ({
    rank_text: row?.rank ?? null,
    rank_value: parseMaybeNumber(row?.rank),
    player: row?.player ?? '',
    country: row?.country ?? null,
    points_text: row?.points ?? null,
    points_value: parseMaybeNumber(row?.points),
    career_high: null,
    change_text: row?.change ?? null,
  }));
}

app.all('/api/tennis/*', async (req, res) => {
  if (!process.env.REACT_APP_RAPIDAPI_KEY) {
    return res.status(500).json({ error: 'Missing REACT_APP_RAPIDAPI_KEY in server/.env' });
  }

  try {
    const queryIndex = req.originalUrl.indexOf('?');
    const queryString = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
    const targetUrl = `${RAPIDAPI_BASE_URL}${req.path}${queryString}`;
    const method = req.method.toUpperCase();

    const response = await fetch(targetUrl, {
      method,
      headers: buildRapidApiHeaders(req.headers['content-type']),
      body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(req.body ?? {}),
    });

    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);

    const bodyBuffer = Buffer.from(await response.arrayBuffer());
    return res.status(response.status).send(bodyBuffer);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy request failed', detail: error.message });
  }
});

app.get('/api/rankings/live/:tour/:category', async (req, res) => {
  const { tour, category } = req.params;
  const normalizedTour = String(tour || '').toLowerCase();
  const normalizedCategory = String(category || '').toLowerCase();

  if (!['atp', 'wta'].includes(normalizedTour)) {
    return res.status(400).json({ error: 'tour must be atp or wta' });
  }

  if (!['singles', 'doubles'].includes(normalizedCategory)) {
    return res.status(400).json({ error: 'category must be singles or doubles' });
  }

  try {
    let rows = [];

    if (normalizedCategory === 'singles') {
      const payload = await fetchRapidApiJson(`/api/tennis/rankings/${normalizedTour}/live`);
      rows = normalizeRankingRows(payload?.rankings || payload?.rows || payload?.standings || []);
    } else {
      rows = await getDoublesRankingsFromStaticFile(normalizedTour);
    }

    return res.json({
      fetched_at: new Date().toISOString(),
      count: rows.length,
      rows,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load live rankings', detail: error.message });
  }
});

app.get('/api/atp-tournaments', async (req, res) => {
  if (!dbPool) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured in server/.env' });
  }

  const limitRaw = Number.parseInt(String(req.query.limit ?? '50'), 10);
  const offsetRaw = Number.parseInt(String(req.query.offset ?? '0'), 10);
  const yearRaw = String(req.query.year ?? '').trim();
  const monthRaw = String(req.query.month ?? '').trim();
  const searchRaw = String(req.query.search ?? '').trim();
  const tourTypeRaw = String(req.query.tour_type ?? 'atp').trim();

  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;
  const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

  const whereParts = [];
  const params = [];

  if (tourTypeRaw) {
    params.push(tourTypeRaw);
    whereParts.push(`LOWER(tour_type) = LOWER($${params.length})`);
  }

  if (/^\d{4}$/.test(yearRaw)) {
    params.push(yearRaw);
    const yearParam = params.length;
    params.push(Number.parseInt(yearRaw, 10));
    whereParts.push(`(date_text ILIKE '%' || $${yearParam} || '%' OR EXTRACT(YEAR FROM fetched_at) = $${params.length})`);
  }

  if (/^(?:[1-9]|1[0-2])$/.test(monthRaw)) {
    const monthNum = Number.parseInt(monthRaw, 10);
    const monthText = new Date(2000, monthNum - 1, 1).toLocaleString('en-US', { month: 'long' });
    const monthShort = new Date(2000, monthNum - 1, 1).toLocaleString('en-US', { month: 'short' });
    params.push(monthText);
    const monthLongParam = params.length;
    params.push(monthShort);
    whereParts.push(`(date_text ILIKE '%' || $${monthLongParam} || '%' OR date_text ILIKE '%' || $${params.length} || '%')`);
  }

  if (searchRaw) {
    params.push(`%${searchRaw}%`);
    whereParts.push(`(title_text ILIKE $${params.length} OR full_text ILIKE $${params.length} OR event_slug ILIKE $${params.length})`);
  }

  const whereSql = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM tennisdb.tournaments
    ${whereSql}
  `;

  params.push(limit, offset);
  const listSql = `
    SELECT
      id,
      event_slug,
      event_id,
      title_text,
      date_text,
      full_text,
      tour_type,
      overview_url,
      source_url,
      fetched_at
    FROM tennisdb.tournaments
    ${whereSql}
    ORDER BY fetched_at DESC, id DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  try {
    const [countResult, listResult] = await Promise.all([
      dbPool.query(countSql, params.slice(0, params.length - 2)),
      dbPool.query(listSql, params),
    ]);

    return res.json({
      pagination: {
        limit,
        offset,
        total: countResult.rows?.[0]?.total ?? 0,
        returned: listResult.rowCount ?? 0,
      },
      rows: listResult.rows ?? [],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load ATP tournaments', detail: error.message });
  }
});
// Direct tweet endpoint
app.post('/tweet/live', async (req, res) => {
  const { msg, env = 'test' } = req.body;

  if (!msg) {
    return res.status(400).json({ success: false, error: 'msg is required' });
  }

  const creds = env === 'prod'
    ? {
        appKey: process.env.PROD_CONSUMER_KEY,
        appSecret: process.env.PROD_CONSUMER_SECRET,
        accessToken: process.env.PROD_ACCESS_TOKEN,
        accessSecret: process.env.PROD_ACCESS_SECRET,
      }
    : {
        appKey: process.env.TEST_CONSUMER_KEY,
        appSecret: process.env.TEST_CONSUMER_SECRET,
        accessToken: process.env.TEST_ACCESS_TOKEN,
        accessSecret: process.env.TEST_ACCESS_SECRET,
      };

  try {
    const client = new TwitterApi(creds);
    const result = await client.v2.tweet(msg);
    console.log('Tweet sent:', result.data.id);
    return res.json({ success: true, tweetId: result.data.id });
  } catch (error) {
    const status = error?.code || error?.status || error?.response?.status;
    const data = error?.response?.data || error?.data || null;
    console.error('Tweet error:', { message: error.message, status, data });
    let errMsg = error.message;
    if (status) errMsg += ` (status: ${status})`;
    return res.status(500).json({ success: false, error: errMsg, status, data });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React build in production (Option B)
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

// Catch-all to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Proxy + static server running on http://localhost:${PORT}`);
});
