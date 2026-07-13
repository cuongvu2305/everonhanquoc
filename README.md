# everonhanquoc

Demo storefront for a bedding and mattress shop.

## Stack

- Frontend: React built with Vite, Ant Design, Lucide icons
- Backend local: Python standard library HTTP server
- Database local: SQLite at `backend/data/everonhanquoc.sqlite3`
- Hosting artifact: `npm run build` generates `dist/` for Sites

## Development

```bash
npm run dev
```

Open:

```txt
http://127.0.0.1:4173
```

## Verification And Deployment

Run the release workflow in this order:

```bash
npm run lint
npm run test
npm run test:build
python3 -m unittest backend.test_app
npm run build
npm run deploy:firebase
```

`npm run deploy:firebase` rebuilds the static Firebase Hosting artifact before deploying it.

## Build

```bash
npm run build
```

The build generates:

```txt
dist/index.html
dist/assets/
dist/api/health
dist/api/storefront
dist/build-info.json
```

Firebase Hosting serves the Vite SPA from `dist/`; the static API fixtures remain available at `/api/health` and `/api/storefront`.

`npm run backend` serves the built Vite application from `dist/` alongside the local SQLite API. If `dist/` does not exist, API requests remain available and frontend requests return `503`; run `npm run build` first.

## Data

Local development uses SQLite through `backend/db.py`.

The initial seed data is stored in:

```txt
backend/data/storefront.json
```

To reset local SQLite data, delete:

```txt
backend/data/everonhanquoc.sqlite3
```

Then run `npm run dev` again.
