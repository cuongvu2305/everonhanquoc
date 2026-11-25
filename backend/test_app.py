import json
import sys
import tempfile
import threading
import unittest
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

import app
import db


class AppArgumentsTest(unittest.TestCase):
    def test_port_argument_overrides_default(self):
        self.assertEqual(app.parse_args(["--port", "4174"]).port, 4174)

    def test_public_host_is_rejected(self):
        with self.assertRaises(SystemExit):
            app.parse_args(["--host", "0.0.0.0"])

    def test_server_header_does_not_disclose_python_version(self):
        self.assertNotIn("Python", app.StorefrontHandler.server_version)
        self.assertEqual(app.StorefrontHandler.sys_version, "")


class StaticDirectoryTest(unittest.TestCase):
    def test_uses_dist_when_a_production_build_exists(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            dist_dir = Path(temp_dir) / "dist"
            dist_dir.mkdir()

            with patch.object(app, "DIST_DIR", dist_dir):
                self.assertEqual(app.get_static_directory(), dist_dir)

    def test_returns_no_static_directory_when_no_build_exists(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            missing_dist_dir = Path(temp_dir) / "dist"

            with patch.object(app, "DIST_DIR", missing_dist_dir):
                self.assertIsNone(app.get_static_directory())

    def test_frontend_requests_return_service_unavailable_without_a_build(self):
        handler = object.__new__(app.StorefrontHandler)
        handler.path = "/"
        handler.static_directory = None
        handler.send_error = Mock()

        handler.do_GET()

        handler.send_error.assert_called_once_with(
            503, "Frontend build is unavailable; run npm run build"
        )


class StorefrontApiSetUpTest(unittest.TestCase):
    def test_failed_server_creation_restores_database_path_and_temp_directory(self):
        original_db_path = db.DATABASE_PATH
        test = StorefrontApiTest("test_health_endpoint_returns_ok")

        with patch(f"{__name__}.ThreadingHTTPServer", side_effect=OSError("bind failed")):
            result = unittest.TestResult()
            test.run(result)

        self.assertEqual(len(result.errors), 1)
        self.assertIn("bind failed", result.errors[0][1])
        self.assertEqual(db.DATABASE_PATH, original_db_path)
        self.assertFalse(Path(test.temp_dir.name).exists())


class StorefrontApiTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.original_db_path = db.DATABASE_PATH
        db.DATABASE_PATH = Path(self.temp_dir.name) / "storefront.sqlite3"
        self.addCleanup(self.restore_database_path)
        db.init_database()
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), app.StorefrontHandler)
        self.addCleanup(self.server.server_close)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.addCleanup(self.join_server_thread)
        self.thread.start()
        self.addCleanup(self.server.shutdown)

    def restore_database_path(self):
        db.DATABASE_PATH = self.original_db_path

    def join_server_thread(self):
        if self.thread.is_alive():
            self.thread.join()

    def get_json(self, path):
        connection = HTTPConnection("127.0.0.1", self.server.server_port)
        connection.request("GET", path)
        response = connection.getresponse()
        payload = json.loads(response.read())
        connection.close()
        return response.status, payload

    def test_health_endpoint_returns_ok(self):
        status, payload = self.get_json("/api/health")
        self.assertEqual(status, 200)
        self.assertTrue(payload["ok"])

    def test_storefront_endpoint_returns_expected_collections(self):
        status, payload = self.get_json("/api/storefront")
        self.assertEqual(status, 200)
        self.assertEqual(set(payload), {"categories", "tiles", "banners", "showrooms", "products", "policies"})
        self.assertIsInstance(payload["products"], list)

    def test_storefront_endpoint_returns_banners_from_seed_data(self):
        _, payload = self.get_json("/api/storefront")
        seed = json.loads(db.DATA_FILE.read_text(encoding="utf-8"))

        self.assertEqual(payload["banners"], seed["banners"])

    def test_storefront_endpoint_returns_showrooms_from_seed_data(self):
        _, payload = self.get_json("/api/storefront")
        seed = json.loads(db.DATA_FILE.read_text(encoding="utf-8"))

        self.assertEqual(payload["showrooms"], seed["showrooms"])

    def test_storefront_endpoint_returns_optional_product_fields(self):
        _, payload = self.get_json("/api/storefront")
        seed = json.loads(db.DATA_FILE.read_text(encoding="utf-8"))
        optional_fields = ("material", "rating", "outOfStock", "collection")

        for expected, actual in zip(seed["products"], payload["products"], strict=True):
            for field in optional_fields:
                self.assertEqual(actual.get(field), expected.get(field), f"{expected['name']}: {field}")
        self.assertTrue(any(product.get("outOfStock") for product in payload["products"]))


class DatabaseMigrationTest(unittest.TestCase):
    def setUp(self):
        temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(temp_dir.cleanup)
        patcher = patch.object(db, "DATABASE_PATH", Path(temp_dir.name) / "legacy.sqlite3")
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_legacy_database_is_migrated_and_reseeded_with_new_fields(self):
        # A database created before banners and the optional product columns existed,
        # already holding the full product/category counts, must still pick them up.
        seed = json.loads(db.DATA_FILE.read_text(encoding="utf-8"))
        with db.get_connection() as connection:
            connection.executescript(
                """
                CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0);
                CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category_id INTEGER NOT NULL,
                  sale TEXT NOT NULL DEFAULT '-', price TEXT NOT NULL, old_price TEXT, image TEXT NOT NULL,
                  source_url TEXT, sort_order INTEGER NOT NULL DEFAULT 0);
                """
            )
            connection.executemany(
                "INSERT INTO categories (name) VALUES (?)", [(name,) for name in seed["categories"]]
            )
            connection.executemany(
                "INSERT INTO products (name, category_id, price, image) VALUES (?, 1, '0', '')",
                [(product["name"],) for product in seed["products"]],
            )

        data = db.load_storefront_data()

        self.assertEqual(data["banners"], seed["banners"])
        self.assertEqual(data["products"][0].get("material"), seed["products"][0].get("material"))

    def test_connection_is_closed_after_use(self):
        with db.get_connection() as connection:
            connection.execute("SELECT 1")

        with self.assertRaises(db.sqlite3.ProgrammingError):
            connection.execute("SELECT 1")


if __name__ == "__main__":
    unittest.main()
