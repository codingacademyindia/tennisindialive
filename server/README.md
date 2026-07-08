Deployment notes - Single Render Web Service

This server is set up to serve the React production build and provide API proxy endpoints.

Build & Start (production)

1. At project root, run:

```bash
npm install
npm run build
cd server
npm install
npm start
```

2. Render setup (single Web Service):
- Build command: `npm install && npm run build && cd server && npm install`
- Start command: `npm start`
- Set environment variables in Render (if needed): `PORT` (optional)

Notes:
- The client will make API calls to relative paths (e.g. `/tweet/live`). The server proxies those to the remote `cai-service.onrender.com`.
- Ensure `build/` exists at the repo root when the server starts.
