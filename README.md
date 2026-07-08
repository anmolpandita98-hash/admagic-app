# AdMagic

AdMagic is a performance-marketing tracking platform: it turns clicks into attributed conversions through a click -> redirect -> postback pipeline, enforces geo and conversion caps, and reports real revenue and payout figures aggregated from Firestore. It also includes a Neuro Creative Lab that scores ad creatives using Gemini.

The app is a single deployable: one Express server that serves both the JSON/tracking API and the built React SPA.

## Prerequisites

- Node.js 20 or newer
- A Firebase project with Firestore enabled, and a service-account JSON with access to it
- A Gemini API key (for the Neuro Creative Lab and AI Insights)

## Environment variables

Copy `.env.example` to `.env` and fill in:

- `GEMINI_API_KEY` - server-side Gemini key. Used only on the server; never shipped to the browser.
- `GOOGLE_APPLICATION_CREDENTIALS` - absolute path to your Firebase service-account JSON. Required by the Admin SDK for Firestore access and ID-token verification. The server boots without it but returns 500s on the first Firestore call.
- `PORT` - port the server listens on (defaults to 3000).
- `META_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_ID` - public client IDs (optional, not secrets).

The Firebase web config (project ID, named database ID, etc.) is read from `firebase-applet-config.json` in the repo root.

## Development

```bash
npm install
npm run dev
```

This runs the Express server with Vite in middleware mode, serving the SPA and API together on `PORT` (default 3000). It requires `GOOGLE_APPLICATION_CREDENTIALS` to be set for anything that touches Firestore.

## Production build and run

```bash
npm run build          # builds the SPA to dist/client and the server to dist/server.cjs
npm start              # runs node dist/server.cjs
```

Example:

```bash
NODE_ENV=production PORT=4444 GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json npm start
```

The SPA is served from `dist/client`; the compiled backend bundle at `dist/server.cjs` is not publicly served.

## Docker

The service account is mounted at runtime, never baked into the image:

```bash
docker build -t admagic .
docker run -p 3000:3000 \
  -v /path/to/sa.json:/sa.json \
  -e GOOGLE_APPLICATION_CREDENTIALS=/sa.json \
  -e GEMINI_API_KEY=your_key \
  admagic
```

Then visit `http://localhost:3000/` and check `http://localhost:3000/api/health`.

## Firestore security rules and indexes

Deploy the security rules and composite indexes (the named database ID lives in `firebase.json`):

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Index builds take a few minutes; deploy them before relying on the reporting endpoints.

## API surface

Public (no auth): `/api/track/click`, `/api/track/postback`, `/sl/:id`, `/api/health`, `/api/docs`.

Authenticated (Firebase ID token as `Authorization: Bearer <token>`): campaign creation, all `/api/automation/*` routes, `/api/reports/*`, and `/api/ai/insights`.

Postbacks on campaigns created with a `postback_token` must include `&token=<token>`; legacy token-less campaigns are accepted but flagged `unverified`.
