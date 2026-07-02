const categories = [
  "San pham giam gia",
  "Ruot goi everon",
  "Ruot chan everon",
  "Chan - ga - goi everon",
  "Bo Everon 2026",
  "Bo Everon 2025",
  "Bo Everon 2024",
  "Bo san pham cao cap Artemis",
  "Dem Everon",
  "Dem bong ep everon",
  "Dem lo xo everon - kingkoil",
  "Dem cao su Everon",
];

const categoryTiles = [
  {
    name: "Dem lo xo",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Dem bong ep",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Chan ga goi Everon",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Ruot chan",
    image:
      "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Ruot goi",
    image:
      "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Dem cao su thien nhien",
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=700&q=80",
  },
];

const featuredProducts = [
  {
    name: "Bo chan ga ESM-22013 giam gia",
    sale: "-50%",
    price: "2.715.000d",
    oldPrice: "5.430.000d",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Bo chan ga ESTR-23054",
    sale: "-50%",
    price: "724.500d",
    oldPrice: "1.449.000d",
    image:
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Bo chan ga ESM-23013",
    sale: "-50%",
    price: "2.924.500d",
    oldPrice: "5.849.000d",
    image:
      "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Bo chan ga goi ESB-22051",
    sale: "-50%",
    price: "2.740.000d",
    oldPrice: "5.480.000d",
    image:
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Dem bong ep Standard",
    sale: "-20%",
    price: "1.932.000d",
    oldPrice: "2.415.000d",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Dem cao su Natural Charcoal",
    sale: "-20%",
    price: "7.600.000d",
    oldPrice: "9.500.000d",
    image:
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=700&q=80",
  },
];

const sections = [
  { title: "Dem Everon", items: featuredProducts.slice(4).concat(featuredProducts.slice(0, 2)) },
  { title: "San pham giam gia", items: featuredProducts.slice(0, 4) },
  { title: "Bo Everon 2026", items: featuredProducts.slice(1, 5) },
  { title: "Bo san pham cao cap Artemis", items: featuredProducts.slice(2, 6) },
];

const policyItems = [
  "Hang chinh hang, mau moi cap nhat",
  "Tu van kich thuoc mien phi",
  "Giao hang nhanh trong noi thanh",
  "Nhieu chuong trinh uu dai theo bo",
];

function ProductCard({
  product,
}: {
  product: (typeof featuredProducts)[number];
}) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt="" className="product-image" />
        <span className="sale-badge">{product.sale}</span>
      </div>
      <h3>{product.name}</h3>
      <p className="price-row">
        <span>{product.price}</span>
        <del>{product.oldPrice}</del>
      </p>
    </article>
  );
}

export default function Home() {
  return (
    <main className="site-shell">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Dia chi: So 234 Ton Duc Thang - Dong Da - Ha Noi</span>
          <strong>Hotline: 0966452111</strong>
        </div>
      </div>

      <header className="main-header">
        <div className="container header-grid">
          <a className="brand" href="#">
            <span className="brand-mark">E</span>
            <span>
              <strong>EVERON</strong>
              <small>Han Quoc</small>
            </span>
          </a>

          <form className="search" action="#">
            <select aria-label="Danh muc">
              <option>Tat ca danh muc</option>
              <option>Dem Everon</option>
              <option>Chan ga goi</option>
            </select>
            <input aria-label="Tim kiem" placeholder="Tim kiem" />
            <button type="submit">Tim kiem</button>
          </form>

          <div className="header-actions" aria-label="Lien ket">
            <a href="#">f</a>
            <a href="#">t</a>
            <a href="#">y</a>
            <a href="#">@</a>
            <button type="button">0</button>
          </div>
        </div>

        <nav className="nav-bar">
          <div className="container nav-list">
            {[
              "Trang chu",
              "Tin tuc Everon",
              "San pham giam gia",
              "San pham ban le",
              "Lien he",
              "Ve chung toi",
            ].map((item) => (
              <a href="#" key={item}>
                {item}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <div className="container page-grid">
        <aside className="sidebar">
          <h2>Danh muc san pham</h2>
          <ul>
            {categories.map((category) => (
              <li key={category}>
                <a href="#">{category}</a>
              </li>
            ))}
          </ul>
        </aside>

        <section className="content">
          <section className="hero">
            <div>
              <p>Tong dai ly chan ga goi dem</p>
              <h1>Everon Han Quoc</h1>
              <span>Mau moi, uu dai tot, giao hang nhanh tai Ha Noi.</span>
            </div>
          </section>

          <section className="tile-grid" aria-label="Danh muc noi bat">
            {categoryTiles.map((tile) => (
              <a className="category-tile" href="#" key={tile.name}>
                <img src={tile.image} alt="" />
                <span>{tile.name}</span>
              </a>
            ))}
          </section>

          <section className="product-section">
            <div className="section-heading">
              <h2>San pham noi bat</h2>
            </div>
            <div className="product-grid featured-grid">
              {featuredProducts.map((product) => (
                <ProductCard product={product} key={product.name} />
              ))}
            </div>
          </section>

          {sections.map((section) => (
            <section className="product-section" key={section.title}>
              <div className="section-heading section-heading-split">
                <h2>{section.title}</h2>
                <a href="#">Xem tat ca</a>
              </div>
              <div className="product-grid">
                {section.items.map((product) => (
                  <ProductCard
                    product={product}
                    key={`${section.title}-${product.name}`}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="info-band">
            {policyItems.map((item) => (
              <div key={item}>
                <span />
                <strong>{item}</strong>
              </div>
            ))}
          </section>
        </section>
      </div>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h2>Everon Han Quoc</h2>
            <p>
              Mo phong storefront dai ly chan ga goi dem voi danh muc, san
              pham noi bat, gia uu dai va thong tin lien he ro rang.
            </p>
          </div>
          <div>
            <h3>Thong tin cua hang</h3>
            <p>234 Ton Duc Thang, Dong Da, Ha Noi</p>
            <p>Hotline: 0966452111</p>
          </div>
          <div>
            <h3>Danh muc</h3>
            <p>Dem Everon</p>
            <p>Chan ga goi</p>
            <p>Ruot chan va ruot goi</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
