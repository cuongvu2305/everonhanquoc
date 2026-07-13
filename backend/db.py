import json
import sqlite3
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent
DATA_FILE = BACKEND_DIR / "data" / "storefront.json"
DATABASE_PATH = BACKEND_DIR / "data" / "everonhanquoc.sqlite3"
SCHEMA_FILE = BACKEND_DIR / "schema.sql"


def get_connection():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_database():
    with get_connection() as connection:
        connection.executescript(SCHEMA_FILE.read_text(encoding="utf-8"))
        ensure_migrations(connection)
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        product_count = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        category_count = connection.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
        expected_product_count = len(data.get("products", []))
        expected_category_count = len(data.get("categories", []))
        if product_count != expected_product_count or category_count != expected_category_count:
            clear_database(connection)
            seed_database(connection)


def ensure_migrations(connection):
    product_columns = {
        row["name"]
        for row in connection.execute("PRAGMA table_info(products)").fetchall()
    }
    if "source_url" not in product_columns:
        connection.execute("ALTER TABLE products ADD COLUMN source_url TEXT")


def clear_database(connection):
    connection.execute("DELETE FROM product_categories")
    connection.execute("DELETE FROM products")
    connection.execute("DELETE FROM tiles")
    connection.execute("DELETE FROM policies")
    connection.execute("DELETE FROM categories")


def seed_database(connection):
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))

    category_ids = {}
    for index, name in enumerate(data.get("categories", [])):
        cursor = connection.execute(
            "INSERT OR IGNORE INTO categories (name, sort_order) VALUES (?, ?)",
            (name, index),
        )
        if cursor.lastrowid:
            category_ids[name] = cursor.lastrowid
        else:
            row = connection.execute("SELECT id FROM categories WHERE name = ?", (name,)).fetchone()
            category_ids[name] = row["id"]

    for index, tile in enumerate(data.get("tiles", [])):
        connection.execute(
            "INSERT INTO tiles (name, image, sort_order) VALUES (?, ?, ?)",
            (tile["name"], tile["image"], index),
        )

    for index, product in enumerate(data.get("products", [])):
        category_id = category_ids.get(product["category"])
        if category_id is None:
            cursor = connection.execute(
                "INSERT INTO categories (name, sort_order) VALUES (?, ?)",
                (product["category"], len(category_ids)),
            )
            category_id = cursor.lastrowid
            category_ids[product["category"]] = category_id

        cursor = connection.execute(
            """
            INSERT INTO products (name, category_id, sale, price, old_price, image, source_url, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product["name"],
                category_id,
                product.get("sale", "-"),
                product["price"],
                product.get("oldPrice"),
                product["image"],
                product.get("sourceUrl"),
                index,
            ),
        )
        product_id = cursor.lastrowid
        for category_name in product.get("categories", [product["category"]]):
            related_category_id = category_ids.get(category_name)
            if related_category_id is None:
                related_category_cursor = connection.execute(
                    "INSERT INTO categories (name, sort_order) VALUES (?, ?)",
                    (category_name, len(category_ids)),
                )
                related_category_id = related_category_cursor.lastrowid
                category_ids[category_name] = related_category_id
            connection.execute(
                "INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)",
                (product_id, related_category_id),
            )

    for index, policy in enumerate(data.get("policies", [])):
        connection.execute(
            "INSERT INTO policies (text, sort_order) VALUES (?, ?)",
            (policy, index),
        )


def load_storefront_data():
    init_database()
    with get_connection() as connection:
        categories = [
            row["name"]
            for row in connection.execute("SELECT name FROM categories ORDER BY sort_order, id")
        ]
        tiles = [
            {"name": row["name"], "image": row["image"]}
            for row in connection.execute("SELECT name, image FROM tiles ORDER BY sort_order, id")
        ]
        products = [
            {
                "name": row["name"],
                "category": row["category"],
                "categories": json.loads(row["categories"] or "[]"),
                "sale": row["sale"],
                "price": row["price"],
                "oldPrice": row["old_price"],
                "image": row["image"],
                "sourceUrl": row["source_url"],
            }
            for row in connection.execute(
                """
                SELECT products.name, categories.name AS category, products.sale,
                       products.price, products.old_price, products.image,
                       products.source_url,
                       json_group_array(related_categories.name) AS categories
                FROM products
                JOIN categories ON categories.id = products.category_id
                LEFT JOIN product_categories ON product_categories.product_id = products.id
                LEFT JOIN categories AS related_categories ON related_categories.id = product_categories.category_id
                GROUP BY products.id
                ORDER BY products.sort_order, products.id
                """
            )
        ]
        policies = [
            row["text"]
            for row in connection.execute("SELECT text FROM policies ORDER BY sort_order, id")
        ]

    return {
        "categories": categories,
        "tiles": tiles,
        "products": products,
        "policies": policies,
    }
