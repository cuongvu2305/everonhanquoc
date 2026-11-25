"""Per-product details (image gallery, specs, size/price variants) served by /api/products/<id>.

The data lives in data/product-details.json (detailId -> details). It is loaded lazily and
reloaded when the file changes, so editing the data does not need a server restart.
"""
import json
import re
import threading
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
DETAILS_FILE = BACKEND_DIR / "data" / "product-details.json"
DETAIL_ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

_lock = threading.Lock()
_cache = {"path": None, "mtime": None, "data": {}}


def is_valid_detail_id(detail_id):
    return isinstance(detail_id, str) and len(detail_id) <= 200 and bool(DETAIL_ID_PATTERN.match(detail_id))


def _load_all():
    path = DETAILS_FILE
    try:
        mtime = path.stat().st_mtime_ns
    except FileNotFoundError:
        return {}
    with _lock:
        if _cache["path"] != path or _cache["mtime"] != mtime:
            _cache["data"] = json.loads(path.read_text(encoding="utf-8"))
            _cache["path"] = path
            _cache["mtime"] = mtime
        return _cache["data"]


def load_product_details(detail_id):
    """Return the details dict for detail_id, or None when the id is invalid or unknown."""
    if not is_valid_detail_id(detail_id):
        return None
    return _load_all().get(detail_id)
