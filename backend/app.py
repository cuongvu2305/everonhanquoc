from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from urllib.parse import urlparse

from db import init_database, load_storefront_data


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
PUBLIC_DIR = PROJECT_ROOT / "public"


class StorefrontHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC_DIR), **kwargs)

    def log_message(self, format, *args):
        return

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            self.send_json({"ok": True, "service": "everonhanquoc-backend"})
            return
        if path == "/api/storefront":
            self.send_json(load_storefront_data())
            return
        if path.endswith("-pt.html"):
            self.path = "/index.html"
        return super().do_GET()

    def send_json(self, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def run(host="127.0.0.1", port=4173):
    init_database()
    server = ThreadingHTTPServer((host, port), StorefrontHandler)
    print(f"Python backend running at http://{host}:{port}")
    print("API: /api/storefront")
    print("Database: backend/data/everonhanquoc.sqlite3")
    print(f"Frontend: {PUBLIC_DIR}")
    server.serve_forever()


if __name__ == "__main__":
    run()
