import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent
DATA_FILE = BACKEND_DIR / "data" / "storefront.json"
DATABASE_PATH = BACKEND_DIR / "data" / "everonhanquoc.sqlite3"
SCHEMA_FILE = BACKEND_DIR / "schema.sql"


PRODUCT_MIGRATIONS = {
    "source_url": "TEXT",
    "material": "TEXT",
    "rating": "REAL",
    "out_of_stock": "INTEGER NOT NULL DEFAULT 0",
    "collection": "TEXT",
}


@contextmanager
def get_connection():
    """Open a connection, commit on success, roll back on error and always close.

    sqlite3's own context manager only manages the transaction and leaves the
    file open, which keeps it locked on Windows.
    """
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    try:
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        yield connection
        connection.commit()
    except BaseException:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_database():
    with get_connection() as connection:
        connection.executescript(SCHEMA_FILE.read_text(encoding="utf-8"))
        migrated = ensure_migrations(connection)
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        product_count = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        category_count = connection.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
        banner_count = connection.execute("SELECT COUNT(*) FROM banners").fetchone()[0]
        showroom_count = connection.execute("SELECT COUNT(*) FROM showrooms").fetchone()[0]
        if (
            migrated
            or product_count != len(data.get("products", []))
            or category_count != len(data.get("categories", []))
            or banner_count != len(data.get("banners", []))
            or showroom_count != len(data.get("showrooms", []))
        ):
            clear_database(connection)
            seed_database(connection)


def ensure_migrations(connection):
    """Add columns missing from older databases; return True if any were added."""
    product_columns = {
        row["name"]
        for row in connection.execute("PRAGMA table_info(products)").fetchall()
    }
    migrated = False
    for column, definition in PRODUCT_MIGRATIONS.items():
        if column not in product_columns:
            connection.execute(f"ALTER TABLE products ADD COLUMN {column} {definition}")
            migrated = True
    return migrated


def clear_database(connection):
    connection.execute("DELETE FROM product_categories")
    connection.execute("DELETE FROM products")
    connection.execute("DELETE FROM tiles")
    connection.execute("DELETE FROM banners")
    connection.execute("DELETE FROM showrooms")
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

    for index, banner in enumerate(data.get("banners", [])):
        connection.execute(
            "INSERT INTO banners (title, image, category, sort_order) VALUES (?, ?, ?, ?)",
            (banner["title"], banner["image"], banner["category"], index),
        )

    for index, showroom in enumerate(data.get("showrooms", [])):
        connection.execute(
            """
            INSERT INTO showrooms (name, address, phone, opening_hours, map_url, is_sample, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                showroom["name"],
                showroom["address"],
                showroom["phone"],
                showroom.get("openingHours"),
                showroom.get("mapUrl"),
                1 if showroom.get("isSample") is True else 0,
                index,
            ),
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
            INSERT INTO products (
                name, category_id, sale, price, old_price, image, source_url,
                material, rating, out_of_stock, collection, sort_order
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product["name"],
                category_id,
                product.get("sale", "-"),
                product["price"],
                product.get("oldPrice"),
                product["image"],
                product.get("sourceUrl"),
                product.get("material"),
                product.get("rating"),
                1 if product.get("outOfStock") is True else 0,
                product.get("collection"),
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


def serialize_product(row):
    product = {
        "name": row["name"],
        "category": row["category"],
        **({"collection": row["collection"]} if row["collection"] is not None else {}),
        "categories": json.loads(row["categories"] or "[]"),
        "sale": row["sale"],
        "price": row["price"],
        "oldPrice": row["old_price"],
        "image": row["image"],
        "sourceUrl": row["source_url"],
    }
    # Optional fields are only emitted when set, mirroring storefront.json and
    # the static API so the frontend sees the same shape from both sources.
    if row["material"] is not None:
        product["material"] = row["material"]
    if row["rating"] is not None:
        product["rating"] = row["rating"]
    if row["out_of_stock"]:
        product["outOfStock"] = True
    return product


def serialize_showroom(row):
    showroom = {"name": row["name"], "address": row["address"], "phone": row["phone"]}
    if row["opening_hours"] is not None:
        showroom["openingHours"] = row["opening_hours"]
    if row["map_url"] is not None:
        showroom["mapUrl"] = row["map_url"]
    if row["is_sample"]:
        showroom["isSample"] = True
    return showroom


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
        banners = [
            {"title": row["title"], "image": row["image"], "category": row["category"]}
            for row in connection.execute(
                "SELECT title, image, category FROM banners ORDER BY sort_order, id"
            )
        ]
        showrooms = [
            serialize_showroom(row)
            for row in connection.execute(
                """
                SELECT name, address, phone, opening_hours, map_url, is_sample
                FROM showrooms ORDER BY sort_order, id
                """
            )
        ]
        products = [
            serialize_product(row)
            for row in connection.execute(
                """
                SELECT products.name, categories.name AS category, products.sale,
                       products.price, products.old_price, products.image,
                       products.source_url, products.material, products.rating,
                       products.out_of_stock, products.collection,
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
        "banners": banners,
        "showrooms": showrooms,
        "products": products,
        "policies": policies,
    }
