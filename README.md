# graphql

## Purpose

Small app demonstrating GraphQL usage: login via a signin endpoint, fetch authenticated user data, and render a profile UI with SVG-based statistic charts (XP by project and XP over time).

## Architecture

- Frontend: Vanilla TypeScript with Vite, no UI framework. `index.html` holds
  the markup for both views; the app fills `#sections` and the two chart
  canvases, and toggles which view is visible.
- Layering, lowest first: `dom`/`config` → `auth` → `api` → `services` →
  `charts` → `views` → `router`. Each layer only calls downward.
- Data layer: `src/api` holds the `graphqlRequest` helper and the query
  strings. `src/services` turns responses into what the views need.
- Charts: `src/charts` builds SVG by hand — shared helpers plus one module per
  chart. No charting library.
- Auth: `src/auth` handles signin, JWT storage (`sessionStorage`) and decoding.
  `src/router.ts` uses `isAuthenticated()` to choose the view at startup.

## Quick file map

- `src/main.ts` — entry point: binds the form handlers, calls `boot()`, starts
  the background effects.
- `src/router.ts` — two view states (login / profile), no URL routing.
- `src/config.ts` — endpoints and the storage key.
- `src/dom.ts` — `$` and `el` helpers.
- `src/types.ts` — shared interfaces (GraphQL responses, domain entities).
- `src/auth/*` — `auth.service` (login, token management), `jwt` (decode, expiry).
- `src/api/*` — `client` (request wrapper), `queries` (query constants).
- `src/services/*` — fetch facades and the pure aggregation helpers.
- `src/views/*` — `login.view` (form handlers), `profile.view` (cards + charts).
- `src/charts/*` — `svg` and `tooltip` helpers, `barChart`, `lineChart`.
- `src/effects/*` — decorative canvas backgrounds.

## Run

```bash
npm install
npm run dev
```

`npm run build` runs `tsc && vite build` and writes `dist/`. Serve that output
with any static server:

    npx serve dist -l 8080

The app must be served over HTTP — opening `index.html` from `file://` fails,
since ES modules are blocked on that origin.

## Configuration

- Endpoints and the token key live in `src/config.ts`. The GraphQL helper posts
  JSON `{ query, variables }`.
- The app expects a JWT; it is stored under the `auth_token` key in
  `sessionStorage` and decoded by `src/auth/jwt.ts`.
- XP is filtered to module work only — see `MODULE_XP_WHERE` in
  `src/api/queries.ts` for why summing every transaction overstates the total.

## Troubleshooting

- Type errors: `npm run build` surfaces them (`tsc` runs first, under `strict`).
  Common fixes include removing unused `import type` entries and keeping
  `src/types.ts` in step with the GraphQL schema.
- Network: confirm CORS and endpoint availability; verify signin returns a
  valid JWT.
- Blank profile with a working login: check the browser console for a GraphQL
  error — a wrong field name returns HTTP 200 with an `errors` array.

## Contributors

Ridha Hasan (rihasan)
