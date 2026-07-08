const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3224;

// Middleware
app.use(cors());
app.use(express.json());

const HEADERS = {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
    'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
}
// Proxy endpoint for /tweet/live
app.post('/tweet/live', async (req, res) => {
  const remoteUrl = 'https://cai-service.onrender.com/tweet/live';
  const maxAttempts = 3;
  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const response = await axios.post(remoteUrl, req.body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        // Accept all statuses so we can forward them and decide when to retry
        validateStatus: () => true,
      });

      // Log upstream status for diagnosis
      if (response.status >= 500) {
        console.warn(`Upstream 5xx (attempt ${attempt}):`, response.status, response.data || '<empty>');
        lastError = { status: response.status, data: response.data };
        // simple backoff
        await new Promise((r) => setTimeout(r, attempt * 500));
        continue; // retry
      }

      // Forward response (including 4xx and successful responses)
      return res.status(response.status).json(response.data);
    } catch (err) {
      // Network / Axios errors (timeouts, ECONNRESET, DNS, TLS, etc.)
      console.error(`Proxy network error (attempt ${attempt}):`, err.code || err.message);
      lastError = err;
      await new Promise((r) => setTimeout(r, attempt * 500));
    }
  }

  // After retries, return the most informative response we have
  console.error('Proxy final error:', lastError && (lastError.status || lastError.code || lastError.message || JSON.stringify(lastError)));
  // Log full upstream response/error for diagnostics, but don't expose huge blobs to clients
  if (lastError && lastError.data) {
    try {
      const full = typeof lastError.data === 'string' ? lastError.data : JSON.stringify(lastError.data);
      console.error('Full upstream response (logged, truncated for client):', full);
      const safe = full.length > 1000 ? full.slice(0, 1000) + '...[truncated]' : full;
      if (lastError && lastError.status) {
        return res.status(lastError.status).json({ error: 'Upstream error', details: safe });
      }
      return res.status(502).json({ error: lastError?.message || 'Upstream unreachable', details: safe });
    } catch (e) {
      console.error('Error serializing upstream response for logs:', e && e.message);
    }
  }

  return res.status(502).json({ error: lastError?.message || 'Upstream unreachable' });
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
