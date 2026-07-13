# Backend

Python standard-library backend for `everonhanquoc`.

- Serves frontend static files from `../dist` when a production build exists
- Exposes `/api/health`
- Exposes `/api/storefront` from SQLite
- Creates `data/everonhanquoc.sqlite3` automatically on first run
- Seeds initial data from `data/storefront.json` when the products table is empty

Run from project root:

```bash
npm run dev
```

Or run backend directly:

```bash
python3 backend/app.py
```

Run `npm run build` before `npm run backend`. Without `dist/`, API endpoints remain available but frontend requests return `503` instead of serving stale source files.

To reset local demo data, delete `backend/data/everonhanquoc.sqlite3` and start the backend again.
