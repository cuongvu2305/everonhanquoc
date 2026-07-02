# everonhanquoc

Demo storefront for a bedding and mattress shop.

## Stack

- Frontend: React JSX loaded in the browser, Ant Design, Lucide icons
- Backend local: Python standard library HTTP server
- Database local: SQLite at `backend/data/everonhanquoc.sqlite3`
- Hosting artifact: `npm run build` generates `dist/` for Sites

## Development

```bash
npm run dev
```

Open:

```txt
http://localhost:4173
```

## Build

```bash
npm run build
```

The build generates:

```txt
dist/client
dist/server/index.js
```

For hosted demo, the Worker in `dist/server/index.js` serves static files and exposes:

```txt
/api/health
/api/storefront
```

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
