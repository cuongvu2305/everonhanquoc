import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from urllib.parse import urlparse

from db import init_database, load_storefront_data


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
DIST_DIR = PROJECT_ROOT / "dist"


def get_static_directory():
    if DIST_DIR.is_dir():
        return DIST_DIR
    return None


class StorefrontHandler(SimpleHTTPRequestHandler):
    server_version = "EveronDevelopment"
    sys_version = ""

    def __init__(self, *args, **kwargs):
        self.static_directory = get_static_directory()
        # A fallback directory is required by the base handler, but is never served
        # when no production build is available.
        directory = self.static_directory or BACKEND_DIR
        super().__init__(*args, directory=str(directory), **kwargs)

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
        if self.static_directory is None:
            self.send_error(503, "Frontend build is unavailable; run npm run build")
            return
        last_segment = path.rsplit("/", 1)[-1]
        if path != "/" and "." not in last_segment:
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
    static_directory = get_static_directory()
    if static_directory:
        print(f"Frontend: {static_directory}")
    else:
        print("Frontend: unavailable (run npm run build)")
    server.serve_forever()


def parse_args(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        choices=["127.0.0.1"],
        help="Development server is intentionally restricted to loopback.",
    )
    parser.add_argument("--port", type=int, default=4173)
    return parser.parse_args(argv)


if __name__ == "__main__":
    args = parse_args()
    run(host=args.host, port=args.port)
