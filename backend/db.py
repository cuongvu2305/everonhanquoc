import json
import sqlite3
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent
DATA_FILE = BACKEND_DIR / "data" / "storefront.json"
DB_FILE = BACKEND_DIR / "data" / "everonhanquoc.sqlite3"
SCHEMA_FILE = BACKEND_DIR / "schema.sql"


def get_connection():
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_FILE)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_database():
    with get_connection() as connection:
        connection.executescript(SCHEMA_FILE.read_text(encoding="utf-8"))
        product_count = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        if product_count == 0:
            seed_database(connection)


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

        connection.execute(
            """
            INSERT INTO products (name, category_id, sale, price, old_price, image, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product["name"],
                category_id,
                product.get("sale", "-"),
                product["price"],
                product.get("oldPrice"),
                product["image"],
                index,
            ),
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
                "sale": row["sale"],
                "price": row["price"],
                "oldPrice": row["old_price"],
                "image": row["image"],
            }
            for row in connection.execute(
                """
                SELECT products.name, categories.name AS category, products.sale,
                       products.price, products.old_price, products.image
                FROM products
                JOIN categories ON categories.id = products.category_id
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
