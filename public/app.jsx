const {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  ConfigProvider,
  Divider,
  Drawer,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  Layout,
  List,
  Menu,
  Pagination,
  Radio,
  Row,
  Select,
  Skeleton,
  Space,
  Steps,
  Tag,
  Typography,
  message,
} = antd;

const { Header, Content, Sider, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useEffect, useMemo, useRef, useState } = React;

const colors = {
  brand: {
    primary: "#16842c",
    primaryDark: "#0f6321",
    primarySoft: "#eaf6ed",
    accent: "#d71920",
    accentSoft: "#fde9e9",
  },
  neutral: {
    page: "#f5faf5",
    surface: "#ffffff",
    text: "#243126",
    muted: "#657268",
    border: "#d9e5dc",
  },
};

const globalTheme = {
  token: {
    borderRadius: 6,
    colorPrimary: colors.brand.primary,
    colorInfo: colors.brand.primary,
    colorSuccess: colors.brand.primary,
    colorError: colors.brand.accent,
    colorText: colors.neutral.text,
    colorTextSecondary: colors.neutral.muted,
    colorBorder: colors.neutral.border,
    colorBgLayout: colors.neutral.page,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  components: {
    Button: {
      controlHeight: 38,
    },
    Menu: {
      itemBorderRadius: 0,
    },
    Card: {
      borderRadiusLG: 6,
    },
  },
};

const topPages = [
  { key: "home", icon: "Home" },
  { key: "news", icon: "Newspaper" },
  { key: "sale", icon: "BadgePercent" },
  { key: "retail", icon: "PackageOpen" },
  { key: "contact", icon: "PhoneCall" },
  { key: "about", icon: "Store" },
  { key: "checkout", icon: "CreditCard" },
];

function slugifyCategory(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getHashKey() {
  return window.location.hash.replace("#", "");
}

function getCleanPath() {
  return window.location.pathname.replace(/\/$/, "");
}

function isSearchPath() {
  return getCleanPath() === "/search";
}

function isProductPath() {
  return getCleanPath() === "/product";
}

function getPolicySlugFromLocation() {
  const path = getCleanPath().replace(/^\//, "");
  if (!path) return "";
  return path.endsWith("-pt") ? path : "";
}

function getSearchQueryFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  return (searchParams.get("q") ?? "").trim();
}

function getProductSlugFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  return (searchParams.get("slug") ?? "").trim();
}

function extractProductCode(product) {
  const match = product.name.match(/[A-Z]{2,}-\d{4,}/);
  return match ? match[0] : slugifyCategory(product.name).slice(0, 32);
}

function slugifyProduct(product) {
  return slugifyCategory(product.name);
}

function buildProductUrl(product) {
  const slug = slugifyProduct(product);
  const code = extractProductCode(product);
  return `/product/?slug=${encodeURIComponent(slug)}&code=${encodeURIComponent(code)}`;
}

function navigateToUrl(url) {
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function navigateToProduct(product) {
  navigateToUrl(buildProductUrl(product));
}

function navigateToCategory(category) {
  navigateToUrl(`/#category-${slugifyCategory(category)}`);
}

function navigateToTopPage(key) {
  navigateToUrl(key === "home" ? "/" : `/#${key}`);
}

function navigateToPolicy(slug) {
  navigateToUrl(`/${slug}`);
}

function getPageFromHash() {
  const key = getHashKey();
  if (key.startsWith("category-")) return "category";
  if (topPages.some((page) => page.key === key)) return key;
  if (isSearchPath()) return "search";
  if (isProductPath()) return "product";
  if (getPolicySlugFromLocation()) return "policy";
  return "home";
}

function getCategorySlugFromHash() {
  const key = getHashKey();
  return key.startsWith("category-") ? key.replace("category-", "") : "";
}

function buildSearchUrl(query) {
  return `/search?q=${encodeURIComponent(query.trim())}`;
}

function parsePrice(value) {
  return Number(String(value).replace(/[^0-9]/g, "")) || 0;
}

function formatPrice(value) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

const CART_STORAGE_KEY = "everonhanquoc-cart";

function getStoredCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((item) => typeof item?.slug === "string" && Number(item?.quantity) > 0);
  } catch {
    return [];
  }
}

function storeCart(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

async function requestJson(url, fallbackMessage) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(fallbackMessage);
  }
  return response.json();
}

const storefrontService = {
  getStorefront() {
    return requestJson("/api/storefront", "Unable to load storefront data");
  },
  getLocale(lang) {
    return requestJson(`/locales/${lang}.json?v=locale-1`, "Unable to load locale data");
  },
};

function Icon({ name, size = 18 }) {
  const ref = React.useRef(null);

  useEffect(() => {
    if (!ref.current || !window.lucide || !window.lucide.icons[name]) return;
    const iconNode = window.lucide.createElement(window.lucide.icons[name]);
    iconNode.setAttribute("width", size);
    iconNode.setAttribute("height", size);
    iconNode.setAttribute("stroke-width", "2");
    ref.current.replaceChildren(iconNode);
  }, [name, size]);

  return <span className="lucide-icon" ref={ref} aria-hidden="true" />;
}

function BrandIcon({ name }) {
  if (name === "facebook") {
    return (
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M14.2 8.4V6.8c0-.7.5-.9.9-.9h2.2V2.2L14.2 2c-3.4 0-4.5 2-4.5 4.6v1.8H7v3.8h2.7V22h4.2v-9.8h3.1l.5-3.8h-3.3Z" />
        </svg>
      </span>
    );
  }

  return (
    <span className="brand-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M21.6 7.1a3 3 0 0 0-2.1-2.1C17.6 4.5 12 4.5 12 4.5s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31.7 31.7 0 0 0 2 12a31.7 31.7 0 0 0 .4 4.9 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 22 12a31.7 31.7 0 0 0-.4-4.9ZM10 15.4V8.6l5.8 3.4L10 15.4Z" />
      </svg>
    </span>
  );
}

const EMPTY_DICT = {
  topPages: {},
  categoryMap: {},
  productMap: {},
  tileMap: {},
  policyMap: {},
  newsPosts: [],
  aboutCards: [],
  categoryDesc: "",
  productCount: "{count}",
};

function template(value, params = {}) {
  return String(value ?? "").replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}

function useI18n(lang, localeDict) {
  const rawDict = localeDict ?? EMPTY_DICT;
  const dict = {
    ...EMPTY_DICT,
    ...rawDict,
    topPages: rawDict.topPages ?? EMPTY_DICT.topPages,
    categoryMap: rawDict.categoryMap ?? EMPTY_DICT.categoryMap,
    productMap: rawDict.productMap ?? EMPTY_DICT.productMap,
    tileMap: rawDict.tileMap ?? EMPTY_DICT.tileMap,
    policyMap: rawDict.policyMap ?? EMPTY_DICT.policyMap,
    newsPosts: rawDict.newsPosts ?? EMPTY_DICT.newsPosts,
    aboutCards: rawDict.aboutCards ?? EMPTY_DICT.aboutCards,
    categoryDesc: (category) => template(rawDict.categoryDesc, { category }),
    productCount: (count) => template(rawDict.productCount, { count }),
  };
  const labelCategory = (category) => dict.categoryMap[category] ?? category;
  const labelProduct = (product) => dict.productMap[product.name] ?? product.name;
  const labelTile = (tile) => dict.tileMap[tile.name] ?? tile.name;
  const labelPolicy = (policy) => dict.policyMap[policy] ?? policy;
  return { dict, labelCategory, labelProduct, labelTile, labelPolicy };
}

function useStorefront() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    storefrontService
      .getStorefront()
      .then((data) => { if (active) setStore(data); })
      .catch(() => message.error("Không tải được API storefront"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { store, loading };
}

function useLocale(lang) {
  const [localeDict, setLocaleDict] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    document.documentElement.lang = lang;
    setLoading(true);
    storefrontService
      .getLocale(lang)
      .then((data) => { if (active) setLocaleDict(data); })
      .catch(() => message.error("Không tải được dữ liệu ngôn ngữ"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lang]);

  return { localeDict, loading };
}

function ProductCard({ product, labelProduct }) {
  return (
    <Badge.Ribbon text={product.sale} color="#d71920">
      <Card hoverable className="product-card" onClick={() => navigateToProduct(product)} cover={<Image preview={false} src={product.image} alt={labelProduct(product)} />}>
        <Title level={5}>{labelProduct(product)}</Title>
        <Space wrap>
          <Text className="price">{product.price}</Text>
          <Text delete type="secondary">{product.oldPrice}</Text>
        </Space>
      </Card>
    </Badge.Ribbon>
  );
}

function PageHeader({ icon, title, description, extra }) {
  return (
    <Card className="page-hero">
      <Flex className="page-hero-body" align="flex-start" gap={16}>
        <Flex className="page-hero-icon" align="center" justify="center">
          <Icon name={icon} size={24} />
        </Flex>
        <Flex className="page-hero-copy" vertical>
          <Title level={2}>{title}</Title>
          <Paragraph>{description}</Paragraph>
          {extra ? <Flex className="page-hero-extra" wrap="wrap">{extra}</Flex> : null}
        </Flex>
      </Flex>
    </Card>
  );
}

function SiteHeader({
  dict,
  cartCount,
  searchText,
  setSearchText,
  submitSearch,
  onOpenMobileNav,
}) {
  return (
    <Header className="site-header">
      <div className="site-header-bar">
        <Button
          className="mobile-nav-trigger"
          type="text"
          aria-label="Mở menu điều hướng"
          icon={<Icon name="Menu" size={20} />}
          onClick={onOpenMobileNav}
        />
        <Button className="brand" type="link" onClick={() => navigateToTopPage("home")} aria-label="Everon Hàn Quốc">
          <Image preview={false} src="/assets/logo-everon.png" alt="Everon Hàn Quốc" />
        </Button>
        <Space className="header-actions header-actions-compact">
          <Badge count={cartCount}>
            <Button onClick={() => navigateToTopPage("checkout")} shape="circle" icon={<Icon name="ShoppingCart" />} />
          </Badge>
        </Space>
      </div>
      <Input
        className="search-box"
        allowClear
        maxLength={255}
        prefix={<Icon name="Search" size={16} />}
        placeholder={dict.searchPlaceholder}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value.slice(0, 255))}
        onPressEnter={submitSearch}
      />
    </Header>
  );
}

function MobileNavDrawer({
  open,
  onClose,
  navItems,
  menuItems,
  activePage,
  activeCategory,
  loading,
  dict,
  onNavigateTopPage,
  onNavigateCategory,
}) {
  const collapseItems = [
    {
      key: "product-categories",
      label: dict.productCategories,
      children: loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Menu
          mode="inline"
          selectedKeys={[activeCategory]}
          items={menuItems}
          onClick={({ key }) => onNavigateCategory(key)}
        />
      ),
    },
  ];

  return (
    <Drawer className="mobile-nav-drawer" placement="left" open={open} onClose={onClose} title="Điều hướng" width={320}>
      <Menu
        className="mobile-top-nav"
        mode="inline"
        selectedKeys={[activePage]}
        items={navItems}
        onClick={({ key }) => onNavigateTopPage(key)}
      />
      <Space className="mobile-quick-links" direction="vertical" size={10}>
        <Button href="https://www.facebook.com/everondongda/" target="_blank" rel="noopener noreferrer" icon={<BrandIcon name="facebook" />}>
          Facebook
        </Button>
        <Button href="https://www.youtube.com/channel/UCW8R-hC2rCWSm-T2fFyQcFw" target="_blank" rel="noopener noreferrer" icon={<BrandIcon name="youtube" />}>
          YouTube
        </Button>
      </Space>
      <Collapse className="mobile-category-collapse" items={collapseItems} defaultActiveKey={[]} />
    </Drawer>
  );
}

function ProductGrid({ products, labelProduct, emptyText, paginated = false, pageSize = 9 }) {
  const [currentPage, setCurrentPage] = useState(1);
  if (products.length === 0) return <Empty description={emptyText} />;
  const visibleProducts = paginated ? products.slice((currentPage - 1) * pageSize, currentPage * pageSize) : products;
  return (
    <>
      <Row gutter={[16, 16]}>
        {visibleProducts.map((product) => (
          <Col xs={12} sm={12} lg={8} xl={8} key={product.sourceUrl || product.name}>
            <ProductCard product={product} labelProduct={labelProduct} />
          </Col>
        ))}
      </Row>
      {paginated && products.length > pageSize ? (
        <Flex className="product-pagination" justify="center">
          <Pagination current={currentPage} pageSize={pageSize} total={products.length} showSizeChanger={false} onChange={setCurrentPage} />
        </Flex>
      ) : null}
    </>
  );
}

function ProductCarousel({ title, products, labelProduct, emptyText, onViewAll }) {
  const scrollerRef = useRef(null);
  const scrollProducts = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.max(320, node.clientWidth * 0.88), behavior: "smooth" });
  };

  return (
    <Card className="product-carousel-section">
      <Flex className="product-carousel-header" align="center" justify="space-between" gap={12}>
        <Title level={4}>{title}</Title>
        <Space>
          {onViewAll ? <Button size="small" onClick={onViewAll}>{dictViewAllLabel()}</Button> : null}
          <Button aria-label={`Xem sản phẩm trước trong ${title}`} icon={<Icon name="ChevronLeft" />} onClick={() => scrollProducts(-1)} />
          <Button aria-label={`Xem sản phẩm tiếp trong ${title}`} icon={<Icon name="ChevronRight" />} onClick={() => scrollProducts(1)} />
        </Space>
      </Flex>
      {products.length === 0 ? (
        <Empty description={emptyText} />
      ) : (
        <div className="product-carousel-track" ref={scrollerRef}>
          {products.map((product) => (
            <div className="product-carousel-item" key={product.sourceUrl || product.name}>
              <ProductCard product={product} labelProduct={labelProduct} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function dictViewAllLabel() {
  return "Xem tất cả";
}

function PolicyGrid({ policies, labelPolicy }) {
  return (
    <Flex className="policy-grid" gap={12} wrap="wrap">
      {policies.map((policy) => <Card key={policy}><Space><Icon name="ShieldCheck" /> <Text>{labelPolicy(policy)}</Text></Space></Card>)}
    </Flex>
  );
}

function HomePage({ activeCategory, filteredProducts, menuItems, setActiveCategory, store, langTools }) {
  const { dict, labelProduct, labelTile } = langTools;
  const tileCategoryMap = {};
  const tileIconMap = {
    "Đệm lò xo everon - kingkoil": "Building2",
    "Đệm bông ép everon": "BedDouble",
    "Chăn - ga - gối everon": "BedSingle",
    "Ruột chăn everon": "PackageOpen",
    "Ruột gối everon": "Package",
    "Đệm cao su Everon": "Layers3",
  };
  const categoryEntryTiles = store.tiles.map((tile) => ({
    ...tile,
    iconName: tileIconMap[tile.name] ?? "PackageOpen",
  }));
  const openTileCategory = (tileName) => {
    navigateToCategory(tileCategoryMap[tileName] ?? tileName);
  };
  const productsByCategory = (category) => store.products.filter((product) => product.category === category || product.categories?.includes(category));
  return (
    <>
      <Card className="hero hero-compact">
        <Flex vertical align="flex-start" gap={10}>
          <Tag color="#d71920">{dict.heroTag}</Tag>
          <Title level={1}>{dict.heroTitle}</Title>
          <Paragraph>{dict.heroText}</Paragraph>
        </Flex>
      </Card>

      <section className="home-category-entry">
        <div className="home-category-entry-track">
          {categoryEntryTiles.map((tile) => (
            <Card
              key={tile.name}
              hoverable
              className="category-card category-entry-card"
              onClick={() => openTileCategory(tile.name)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openTileCategory(tile.name);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="category-card-icon category-entry-card-icon" aria-hidden="true">
                <Icon name={tile.iconName} size={42} />
              </div>
              <Button type="link" className="category-card-title" onClick={(event) => { event.stopPropagation(); openTileCategory(tile.name); }}>
                {labelTile(tile)}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <Flex className="home-product-sections" vertical gap={16}>
        {store.tiles.map((tile) => (
          <ProductCarousel
            key={tile.name}
            title={labelTile(tile)}
            products={productsByCategory(tile.name)}
            labelProduct={labelProduct}
            emptyText={dict.emptyCategory}
            onViewAll={() => openTileCategory(tile.name)}
          />
        ))}
      </Flex>
    </>
  );
}

function NewsPage({ dict }) {
  return (
    <>
      <PageHeader icon="Newspaper" title={dict.newsTitle} description={dict.newsDesc} />
      <Row gutter={[16, 16]}>
        {dict.newsPosts.map(([title, text]) => (
          <Col xs={24} md={8} key={title}>
            <Card className="content-card">
              <Tag color="#16842c">{dict.advice}</Tag>
              <Title level={4}>{title}</Title>
              <Paragraph>{text}</Paragraph>
              <Button type="link">{dict.readMore}</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

function SalePage({ products, langTools }) {
  const { dict, labelProduct } = langTools;
  return <Card className="section-panel page-panel"><PageHeader icon="BadgePercent" title={dict.saleTitle} description={dict.saleDesc} /><ProductGrid products={products} labelProduct={labelProduct} emptyText={dict.emptyCategory} /></Card>;
}

function RetailPage({ products, langTools }) {
  const { dict, labelProduct } = langTools;
  return <Card className="section-panel page-panel"><PageHeader icon="PackageOpen" title={dict.retailTitle} description={dict.retailDesc} /><ProductGrid products={products} labelProduct={labelProduct} emptyText={dict.emptyCategory} /></Card>;
}

function CategoryPage({ category, products, siblingCategories, langTools }) {
  const { dict, labelCategory, labelProduct } = langTools;
  const relatedCategories = siblingCategories.filter((item) => item !== category);
  const displayCategory = labelCategory(category);
  return (
    <Card className="section-panel page-panel category-page">
      <PageHeader
        icon="Layers3"
        title={displayCategory}
        description={dict.categoryDesc(displayCategory)}
        extra={
          <Space wrap size={[8, 8]}>
            <Tag color="#16842c">{dict.productCount(products.length)}</Tag>
            <Button size="small" onClick={() => navigateToTopPage("retail")} icon={<Icon name="PackageOpen" />}>
              {dict.viewAllProducts}
            </Button>
          </Space>
        }
      />
      <ProductGrid key={category} products={products} labelProduct={labelProduct} emptyText={dict.emptyCategory} paginated pageSize={9} />
      {relatedCategories.length > 0 ? (
        <Flex className="related-categories" vertical>
          <Title level={4}>{dict.relatedCategories}</Title>
          <Space wrap>{relatedCategories.slice(0, 8).map((item) => <Button key={item} onClick={() => navigateToCategory(item)}>{labelCategory(item)}</Button>)}</Space>
        </Flex>
      ) : null}
    </Card>
  );
}

function SearchPage({ products, query, langTools }) {
  const { dict, labelProduct } = langTools;
  const normalizedQuery = query.trim().toLowerCase();
  const results = products.filter((product) => {
    const displayName = labelProduct(product).toLowerCase();
    const category = product.category.toLowerCase();
    return normalizedQuery.length > 0 && (product.name.toLowerCase().includes(normalizedQuery) || displayName.includes(normalizedQuery) || category.includes(normalizedQuery));
  });

  return (
    <Card className="section-panel page-panel search-page">
      <PageHeader
        icon="Search"
        title={dict.searchResultsTitle}
        description={dict.searchResultsDesc.replace("{query}", query || "...")}
        extra={
          <Space wrap size={[8, 8]}>
            <Tag color="#16842c">{dict.productCount(results.length)}</Tag>
            <Button size="small" href="/" icon={<Icon name="Home" />}>
              {dict.topPages.home}
            </Button>
          </Space>
        }
      />
      <ProductGrid products={results} labelProduct={labelProduct} emptyText={dict.emptySearchResults} />
    </Card>
  );
}

function ProductDetailPage({ product, relatedProducts, langTools, onAddToCart }) {
  const { dict, labelCategory, labelProduct } = langTools;

  if (!product) {
    return (
      <Card className="section-panel page-panel">
        <Empty description={dict.productNotFound} />
      </Card>
    );
  }

  return (
    <Card className="section-panel page-panel product-detail-page">
      <Row gutter={[24, 24]} align="top">
        <Col xs={24} lg={11}>
          <Image className="product-detail-image" preview={false} src={product.image} alt={labelProduct(product)} />
        </Col>
        <Col xs={24} lg={13}>
          <Flex vertical gap={14}>
            <Space wrap>
              <Tag color="#16842c">{labelCategory(product.category)}</Tag>
              <Tag color="#d71920">{product.sale}</Tag>
            </Space>
            <Title level={2}>{labelProduct(product)}</Title>
            <Space align="baseline" wrap>
              <Text className="product-detail-price">{product.price}</Text>
              <Text delete type="secondary">{product.oldPrice}</Text>
            </Space>
            <Space wrap className="product-detail-actions">
              <Button type="primary" size="large" icon={<Icon name="ShoppingCart" />} onClick={() => onAddToCart(product)}>
                {dict.addToCart}
              </Button>
              <Button size="large" onClick={() => navigateToTopPage("contact")} icon={<Icon name="PhoneCall" />}>
                {dict.contactConsulting}
              </Button>
            </Space>
            <Paragraph className="product-detail-desc">{dict.productDetailDesc}</Paragraph>
            <div className="product-detail-info">
              <Flex vertical gap={10}>
                <Flex justify="space-between" gap={16}><Text type="secondary">{dict.productCode}</Text><Text strong>{extractProductCode(product)}</Text></Flex>
                <Flex justify="space-between" gap={16}><Text type="secondary">{dict.productCategory}</Text><Button type="link" onClick={() => navigateToCategory(product.category)}>{labelCategory(product.category)}</Button></Flex>
                <Flex justify="space-between" gap={16}><Text type="secondary">{dict.productStatus}</Text><Text>{dict.inStock}</Text></Flex>
              </Flex>
            </div>
          </Flex>
        </Col>
      </Row>

      {relatedProducts.length > 0 ? (
        <section className="related-products">
          <Title level={3}>{dict.relatedProducts}</Title>
          <ProductGrid products={relatedProducts} labelProduct={labelProduct} emptyText={dict.emptyCategory} />
        </section>
      ) : null}
    </Card>
  );
}

const policyPages = [
  { slug: "chinh-sach-bao-mat-pt", title: "Chính sách bảo mật", icon: "ShieldCheck", component: PrivacyPolicyContent },
  { slug: "chinh-sach-bao-hanh-pt", title: "Chính sách bảo hành", icon: "BadgeCheck", component: WarrantyPolicyContent },
  { slug: "mua-hang-va-thanh-toan-pt", title: "Mua hàng và thanh toán", icon: "CreditCard", component: PurchasePaymentPolicyContent },
  { slug: "chinh-sach-doi-tra-pt", title: "Chính sách đổi trả", icon: "RefreshCcw", component: ReturnPolicyContent },
  { slug: "chinh-sach-giao-hang-pt", title: "Chính sách giao hàng", icon: "Truck", component: DeliveryPolicyContent },
  { slug: "chinh-sach-kiem-hang-pt", title: "Chính sách kiểm hàng", icon: "ClipboardCheck", component: InspectionPolicyContent },
];

function PolicySection({ title, items }) {
  return (
    <Card className="policy-section-card" title={title}>
      <List dataSource={items} renderItem={(item) => <List.Item><Text>{item}</Text></List.Item>} />
    </Card>
  );
}

function PolicyLayout({ icon, title, summary, children }) {
  return (
    <Card className="section-panel page-panel policy-page">
      <PageHeader icon={icon} title={title} description={summary} />
      {children}
      <Alert className="policy-contact-note" type="success" showIcon message="Cần hỗ trợ thêm? Liên hệ hotline 0966.452.111 để được tư vấn nhanh." />
    </Card>
  );
}

function PrivacyPolicyContent() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}><PolicySection title="Thông tin thu thập" items={["Họ tên, số điện thoại, địa chỉ nhận hàng và nhu cầu tư vấn sản phẩm.", "Thông tin chỉ dùng để xử lý đơn hàng, giao hàng và hỗ trợ bảo hành khi cần."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Phạm vi sử dụng" items={["Xác nhận đơn hàng, liên hệ giao nhận, thông báo tình trạng xử lý đơn và chăm sóc khách hàng.", "Không bán, trao đổi hoặc chia sẻ thông tin cá nhân cho bên thứ ba ngoài đơn vị vận chuyển/phục vụ đơn hàng."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Bảo vệ dữ liệu" items={["Thông tin được lưu trữ trong phạm vi vận hành cửa hàng.", "Khách hàng có thể yêu cầu kiểm tra, điều chỉnh hoặc xóa thông tin liên hệ đã cung cấp."]} /></Col>
    </Row>
  );
}

function WarrantyPolicyContent() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}><PolicySection title="Điều kiện bảo hành" items={["Sản phẩm còn thông tin mua hàng, tem nhãn hoặc dấu hiệu nhận diện chính hãng.", "Lỗi phát sinh từ chất lượng sản phẩm theo tiêu chuẩn của nhà sản xuất."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Thời hạn tham khảo" items={["Đệm bông ép thường được bảo hành theo chính sách nhà sản xuất.", "Đệm cao su, đệm lò xo có thời hạn bảo hành khác nhau tùy dòng sản phẩm."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Trường hợp không áp dụng" items={["Sản phẩm dùng sai hướng dẫn, bảo quản không đúng cách hoặc bị tác động bởi ngoại lực.", "Hư hỏng do thiên tai, ẩm mốc, cháy nổ hoặc tự ý thay đổi kết cấu sản phẩm."]} /></Col>
    </Row>
  );
}

function PurchasePaymentPolicyContent() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}><PolicySection title="Quy trình mua hàng" items={["Tìm sản phẩm theo danh mục, thanh tìm kiếm hoặc sản phẩm nổi bật trên trang chủ.", "Chọn sản phẩm, kiểm tra thông tin giá và liên hệ cửa hàng nếu cần tư vấn kích thước."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Xác nhận đơn" items={["Khách hàng nhập họ tên, số điện thoại và địa chỉ giao hàng.", "Nhân viên cửa hàng gọi lại để xác nhận đơn, thời gian giao và các ưu đãi đi kèm."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Phương thức thanh toán" items={["Thanh toán khi nhận hàng.", "Chuyển khoản ngân hàng sau khi xác nhận đơn.", "Thanh toán trực tiếp tại cửa hàng."]} /></Col>
    </Row>
  );
}

function ReturnPolicyContent() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}><PolicySection title="Điều kiện đổi trả" items={["Sản phẩm còn nguyên trạng, chưa qua sử dụng và còn đầy đủ bao bì/tem nhãn nếu có.", "Thông tin đổi trả cần được phản hồi sớm sau khi nhận hàng."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Các trường hợp hỗ trợ" items={["Giao sai mẫu, sai kích thước hoặc sai số lượng so với xác nhận đơn.", "Sản phẩm có lỗi kỹ thuật hoặc lỗi ngoại quan được ghi nhận khi nhận hàng."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Lưu ý" items={["Không áp dụng đổi trả với sản phẩm đã qua sử dụng, bị bẩn, hư hại do bảo quản sai cách.", "Sản phẩm đặt riêng theo kích thước đặc biệt sẽ được cửa hàng xác nhận điều kiện đổi trả trước khi đặt."]} /></Col>
    </Row>
  );
}

function DeliveryPolicyContent() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}><PolicySection title="Khu vực giao hàng" items={["Ưu tiên giao nhanh trong nội thành Hà Nội.", "Đơn hàng ở tỉnh/thành khác sẽ được tư vấn phương án vận chuyển phù hợp."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Thời gian giao" items={["Nhân viên xác nhận lịch giao sau khi tiếp nhận đơn.", "Các đơn đệm hoặc sản phẩm kích thước lớn có thể cần lịch giao riêng."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Phí vận chuyển" items={["Phí giao hàng phụ thuộc địa chỉ, kích thước sản phẩm và chương trình ưu đãi từng thời điểm.", "Cửa hàng thông báo rõ phí phát sinh trước khi khách xác nhận đơn."]} /></Col>
    </Row>
  );
}

function InspectionPolicyContent() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}><PolicySection title="Quyền kiểm hàng" items={["Khách hàng kiểm tra mẫu mã, kích thước, số lượng và tình trạng bao bì trước khi nhận.", "Có thể đối chiếu thông tin đơn hàng với nhân viên giao hàng."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Khi phát hiện sai lệch" items={["Thông báo ngay cho cửa hàng hoặc nhân viên giao hàng để được hỗ trợ xử lý.", "Cửa hàng tiếp nhận hình ảnh/thông tin thực tế để xác nhận phương án đổi hoặc bổ sung."]} /></Col>
      <Col xs={24} lg={8}><PolicySection title="Sau khi nhận hàng" items={["Vui lòng giữ lại hóa đơn, thông tin đơn và bao bì trong thời gian đầu để hỗ trợ bảo hành/đổi trả.", "Các phản hồi sau nhận hàng được xử lý theo chính sách đổi trả và bảo hành tương ứng."]} /></Col>
    </Row>
  );
}

function getPolicyBySlug(slug) {
  return policyPages.find((item) => item.slug === slug);
}

function PolicyPage({ slug }) {
  const page = getPolicyBySlug(slug);

  if (!page) {
    return (
      <Card className="section-panel page-panel">
        <Empty description="Không tìm thấy chính sách" />
      </Card>
    );
  }

  const ContentComponent = page.component;

  return (
    <PolicyLayout icon={page.icon} title={page.title} summary={getPolicySummary(page.slug)}>
      <ContentComponent />
    </PolicyLayout>
  );
}

function getPolicySummary(slug) {
  const summaries = {
    "chinh-sach-bao-mat-pt": "Cam kết bảo vệ thông tin khách hàng khi tư vấn, đặt hàng và chăm sóc sau bán.",
    "chinh-sach-bao-hanh-pt": "Áp dụng cho sản phẩm Everon, Artemis và Kingkoil chính hãng do cửa hàng phân phối.",
    "mua-hang-va-thanh-toan-pt": "Hướng dẫn đặt hàng, xác nhận đơn và lựa chọn phương thức thanh toán phù hợp.",
    "chinh-sach-doi-tra-pt": "Hỗ trợ đổi trả khi sản phẩm giao không đúng đơn hoặc phát sinh lỗi được xác nhận.",
    "chinh-sach-giao-hang-pt": "Giao hàng linh hoạt trong nội thành Hà Nội và hỗ trợ gửi hàng theo khu vực phù hợp.",
    "chinh-sach-kiem-hang-pt": "Khách hàng được kiểm tra sản phẩm khi nhận để đảm bảo đúng mẫu, đúng số lượng và tình trạng hàng.",
  };
  return summaries[slug] ?? "";
}

function CheckoutPage({ cartItems, langTools, onRemoveCartItem, onUpdateCartQuantity }) {
  const { dict, labelProduct } = langTools;
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderResult, setOrderResult] = useState(null);
  const subtotal = cartItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const shippingFee = subtotal > 3000000 ? 0 : 80000;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + shippingFee - discount;
  const paymentMessages = {
    cod: "Đơn hàng đã được ghi nhận. Nhân viên sẽ gọi xác nhận và quý khách thanh toán khi nhận hàng.",
    transfer: "Đơn hàng đã được ghi nhận. Nhân viên sẽ gửi thông tin chuyển khoản và xác nhận sau khi nhận thanh toán.",
    store: "Đơn hàng đã được giữ tại cửa hàng. Quý khách có thể đến thanh toán và nhận tư vấn trực tiếp.",
  };
  const submitOrder = async () => {
    if (cartItems.length === 0) {
      setOrderResult(null);
      message.error(dict.emptyCart);
      return;
    }
    try {
      const values = await form.validateFields();
      setOrderResult({ values, paymentMethod, message: paymentMessages[paymentMethod] });
      message.success("Đã xác nhận thông tin thanh toán");
    } catch (error) {
      setOrderResult(null);
      message.error("Vui lòng nhập đủ họ tên, số điện thoại và địa chỉ giao hàng");
    }
  };

  return (
    <>
      <PageHeader icon="CreditCard" title={dict.checkoutTitle} description={dict.checkoutDesc} />
      <Steps className="checkout-steps" current={1} items={[{ title: dict.cart }, { title: dict.information }, { title: dict.confirm }]} />
      <Row gutter={[18, 18]} className="checkout-grid">
        <Col xs={24} lg={15}>
          <Card className="checkout-card" title={dict.shippingInfo}>
            <Form form={form} layout="vertical" requiredMark>
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12}><Form.Item label={dict.recipientName} name="recipientName" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}><Input placeholder={dict.recipientPlaceholder} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={dict.phone} name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}><Input placeholder={dict.phonePlaceholder} /></Form.Item></Col>
              </Row>
              <Form.Item label={dict.shippingAddress} name="shippingAddress" rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}><Input placeholder={dict.addressPlaceholder} /></Form.Item>
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12}><Form.Item label={dict.province}><Select defaultValue="ha-noi" options={[{ value: "ha-noi", label: dict.all === "All" ? "Hanoi" : "Hà Nội" }, { value: "hcm", label: dict.all === "All" ? "Ho Chi Minh City" : "TP. Hồ Chí Minh" }, { value: "other", label: langTools.dict.all === "All" ? "Other province" : "Tỉnh/Thành khác" }]} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={dict.deliveryTime}><Select defaultValue="today" options={[{ value: "today", label: dict.today }, { value: "tomorrow", label: dict.tomorrow }, { value: "schedule", label: dict.schedule }]} /></Form.Item></Col>
              </Row>
              <Form.Item label={dict.note}><Input.TextArea rows={4} placeholder={dict.notePlaceholder} /></Form.Item>
            </Form>
          </Card>
          <Card className="checkout-card" title={dict.paymentMethod}>
            <Radio.Group value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="payment-options"><Radio value="cod">{dict.cod}</Radio><Radio value="transfer">{dict.transfer}</Radio><Radio value="store">{dict.storePayment}</Radio></Radio.Group>
            {orderResult ? <Alert className="checkout-result" type="success" showIcon message="Xác nhận thanh toán" description={orderResult.message} /> : null}
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card className="order-summary" title={dict.orderSummary}>
            {cartItems.length === 0 ? (
              <Empty description={dict.emptyCart} />
            ) : (
              <List
                className="order-summary-list"
                dataSource={cartItems}
                renderItem={(item) => (
                  <List.Item className="order-summary-item">
                    <div className="order-item-main">
                      <Image className="cart-thumb" preview={false} src={item.image} alt={labelProduct(item)} />
                      <div className="order-item-copy">
                        <Text strong className="order-item-title">{labelProduct(item)}</Text>
                        <Text type="secondary">{dict.quantity}: {item.quantity}</Text>
                      </div>
                    </div>
                    <div className="order-item-meta">
                      <div className="order-item-actions">
                        <Space size={10} wrap>
                          <Button shape="circle" icon={<Icon name="Minus" size={14} />} onClick={() => onUpdateCartQuantity(item.slug, item.quantity - 1)} />
                          <Text className="order-item-qty">{item.quantity}</Text>
                          <Button shape="circle" icon={<Icon name="Plus" size={14} />} onClick={() => onUpdateCartQuantity(item.slug, item.quantity + 1)} />
                          <Button danger type="text" icon={<Icon name="Trash2" size={16} />} onClick={() => onRemoveCartItem(item.slug)}>
                            {dict.remove}
                          </Button>
                        </Space>
                      </div>
                      <Text strong className="order-item-total">{formatPrice(parsePrice(item.price) * item.quantity)}</Text>
                    </div>
                  </List.Item>
                )}
              />
            )}
            <Divider />
            <Flex className="summary-row" align="center" justify="space-between" gap={12}><Text>{dict.subtotal}</Text><Text>{formatPrice(subtotal)}</Text></Flex>
            <Flex className="summary-row" align="center" justify="space-between" gap={12}><Text>{dict.shippingFee}</Text><Text>{shippingFee === 0 ? dict.freeShipping : formatPrice(shippingFee)}</Text></Flex>
            <Flex className="summary-row" align="center" justify="space-between" gap={12}><Text>{dict.discount}</Text><Text>-{formatPrice(discount)}</Text></Flex>
            <Flex className="summary-row total-row" align="center" justify="space-between" gap={12}><Text strong>{dict.total}</Text><Text strong>{formatPrice(total)}</Text></Flex>
            <Button block type="primary" size="large" icon={<Icon name="CheckCircle2" />} onClick={submitOrder} disabled={cartItems.length === 0}>{dict.placeOrder}</Button>
            <Button block onClick={() => navigateToTopPage("retail")} className="continue-shopping">{dict.continueShopping}</Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}

function ContactPage({ dict }) {
  return (
    <>
      <PageHeader icon="PhoneCall" title={dict.contactTitle} description={dict.contactDesc} />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}><Card className="content-card"><Title level={4}>{dict.storeInfo}</Title><Space direction="vertical" size={12}><Text><Icon name="MapPin" /> {dict.address}</Text><Text><Icon name="Phone" /> {dict.hotline}</Text><Text><Icon name="Clock" /> {dict.openingHours}</Text></Space></Card></Col>
        <Col xs={24} md={10}><Card className="content-card contact-card"><Title level={4}>{dict.requestTitle}</Title><Space direction="vertical" size={12}><Input placeholder={dict.fullName} /><Input placeholder={dict.phone} /><Input.TextArea rows={4} placeholder={dict.consultingNeed} /><Button type="primary" icon={<Icon name="Send" />}>{dict.sendRequest}</Button></Space></Card></Col>
      </Row>
    </>
  );
}

function AboutPage({ dict }) {
  return (
    <>
      <PageHeader icon="Store" title={dict.aboutTitle} description={dict.aboutDesc} />
      <Row gutter={[16, 16]}>{dict.aboutCards.map(([title, text]) => <Col xs={24} md={8} key={title}><Card className="content-card"><Title level={4}>{title}</Title><Paragraph>{text}</Paragraph></Card></Col>)}</Row>
    </>
  );
}

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [activePage, setActivePage] = useState(getPageFromHash());
  const [activeCategorySlug, setActiveCategorySlug] = useState(getCategorySlugFromHash());
  const [activeProductSlug, setActiveProductSlug] = useState(getProductSlugFromLocation());
  const [activePolicySlug, setActivePolicySlug] = useState(getPolicySlugFromLocation());
  const [searchText, setSearchText] = useState(getSearchQueryFromLocation());
  const [query, setQuery] = useState(getSearchQueryFromLocation());
  const [buildInfo, setBuildInfo] = useState(null);
  const [cartEntries, setCartEntries] = useState(() => getStoredCart());
  const { store, loading: storeLoading } = useStorefront("vi");
  const { localeDict, loading: localeLoading } = useLocale("vi");
  const langTools = useI18n("vi", localeDict);
  const { dict, labelCategory } = langTools;

  useEffect(() => {
    const updatePage = () => {
      setActivePage(getPageFromHash());
      setActiveCategorySlug(getCategorySlugFromHash());
      setActiveProductSlug(getProductSlugFromLocation());
      setActivePolicySlug(getPolicySlugFromLocation());
      const urlQuery = getSearchQueryFromLocation();
      setQuery(urlQuery);
      setSearchText(urlQuery);
    };
    window.addEventListener("hashchange", updatePage);
    window.addEventListener("popstate", updatePage);
    return () => {
      window.removeEventListener("hashchange", updatePage);
      window.removeEventListener("popstate", updatePage);
    };
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [activePage, activeCategorySlug, activeProductSlug, activePolicySlug, query]);

  useEffect(() => {
    if (!store || activePage !== "category") return;
    const category = store.categories.find((item) => slugifyCategory(item) === activeCategorySlug);
    setActiveCategory(category ?? "Tất cả");
  }, [activeCategorySlug, activePage, store]);

  useEffect(() => {
    fetch("/build-info.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (data?.tag) setBuildInfo(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    storeCart(cartEntries);
  }, [cartEntries]);

  const loading = storeLoading || localeLoading;
  const products = store?.products ?? [];
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const displayName = langTools.labelProduct(product).toLowerCase();
      const matchCategory = activeCategory === "Tất cả" || product.category === activeCategory || product.categories?.includes(activeCategory);
      const matchQuery = normalizedQuery.length === 0 || product.name.toLowerCase().includes(normalizedQuery) || displayName.includes(normalizedQuery);
      return matchCategory && matchQuery;
    });
  }, [activeCategory, products, query, langTools]);

  const menuItems = useMemo(() => ["Tất cả", ...(store?.categories ?? [])].map((category) => ({ key: category, label: category === "Tất cả" ? dict.all : labelCategory(category) })), [store, dict.all, labelCategory]);
  const navItems = useMemo(() => topPages.map((page) => ({ key: page.key, icon: <Icon name={page.icon} size={16} />, label: dict.topPages[page.key] })), [dict]);
  const saleProducts = useMemo(() => products.filter((product) => product.sale !== "-"), [products]);
  const categoryPage = useMemo(() => {
    if (!store) return null;
    const category = store.categories.find((item) => slugifyCategory(item) === activeCategorySlug);
    if (!category) return null;
    return { category, products: products.filter((product) => product.category === category || product.categories?.includes(category)) };
  }, [activeCategorySlug, products, store]);

  const productPage = useMemo(() => {
    if (!store || activePage !== "product") return null;
    const product = products.find((item) => slugifyProduct(item) === activeProductSlug);
    const relatedProducts = product ? products.filter((item) => (item.category === product.category || item.categories?.includes(product.category)) && item.name !== product.name).slice(0, 3) : [];
    return { product, relatedProducts };
  }, [activePage, activeProductSlug, products, store]);
  const cartItems = useMemo(() => cartEntries.map((entry) => {
    const product = products.find((item) => slugifyProduct(item) === entry.slug);
    return product ? { ...product, slug: entry.slug, quantity: entry.quantity } : null;
  }).filter(Boolean), [cartEntries, products]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const addToCart = (product) => {
    const slug = slugifyProduct(product);
    setCartEntries((current) => {
      const existing = current.find((item) => item.slug === slug);
      if (existing) {
        return current.map((item) => item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { slug, quantity: 1 }];
    });
    message.success(dict.addedToCart);
  };

  const updateCartQuantity = (slug, quantity) => {
    setCartEntries((current) => quantity <= 0 ? current.filter((item) => item.slug !== slug) : current.map((item) => item.slug === slug ? { ...item, quantity } : item));
  };

  const removeCartItem = (slug) => {
    setCartEntries((current) => current.filter((item) => item.slug !== slug));
    message.success(dict.removedFromCart);
  };

  const submitSearch = () => {
    const nextQuery = searchText.trim();
    if (!nextQuery) return;
    window.history.pushState({}, "", buildSearchUrl(nextQuery));
    setActivePage("search");
    setActiveCategorySlug("");
    setActiveProductSlug("");
    setActiveCategory("Tất cả");
    setQuery(nextQuery);
    setSearchText(nextQuery);
  };

  const handleNavigateTopPage = (key) => {
    navigateToTopPage(key);
    setMobileNavOpen(false);
  };

  const handleNavigateCategory = (key) => {
    setActiveCategory(key);
    key === "Tất cả" ? navigateToTopPage("home") : navigateToCategory(key);
    setMobileNavOpen(false);
  };

  const renderPage = () => {
    if (!store) return null;
    if (activePage === "news") return <NewsPage dict={dict} />;
    if (activePage === "sale") return <SalePage products={saleProducts} langTools={langTools} />;
    if (activePage === "retail") return <RetailPage products={products} langTools={langTools} />;
    if (activePage === "contact") return <ContactPage dict={dict} />;
    if (activePage === "about") return <AboutPage dict={dict} />;
    if (activePage === "checkout") return <CheckoutPage cartItems={cartItems} langTools={langTools} onRemoveCartItem={removeCartItem} onUpdateCartQuantity={updateCartQuantity} />;
    if (activePage === "search") return <SearchPage products={products} query={query} langTools={langTools} />;
    if (activePage === "product") return <ProductDetailPage product={productPage?.product} relatedProducts={productPage?.relatedProducts ?? []} langTools={langTools} onAddToCart={addToCart} />;
    if (activePage === "policy") return <PolicyPage slug={activePolicySlug} />;
    if (activePage === "category" && categoryPage) return <CategoryPage category={categoryPage.category} products={categoryPage.products} siblingCategories={store.categories} langTools={langTools} />;
    return <HomePage activeCategory={activeCategory} filteredProducts={filteredProducts} menuItems={menuItems} setActiveCategory={setActiveCategory} store={store} langTools={langTools} />;
  };
  const footerPolicies = policyPages.map((item) => ({ label: item.title, slug: item.slug }));
  const footerContacts = [
    { icon: "MapPin", text: "Địa chỉ: 234 Tôn Đức Thắng, Q. Đống Đa, Tp. Hà Nội" },
    { icon: "PhoneCall", text: "Hotline: 024.3999.4555 - 0966.452.111" },
    { icon: "Mail", text: "Email: everonngogiatu@gmail.com" },
    { icon: "Globe", text: "Website: http://everonlongbien.com.vn/" },
  ];
  const footerQuickLinks = [
    { icon: <BrandIcon name="facebook" />, label: "Facebook", href: "https://www.facebook.com/everondongda/" },
    { icon: <Icon name="MapPinned" />, label: "Xem chỉ đường", href: "https://www.google.com/maps/search/?api=1&query=234%20T%C3%B4n%20%C4%90%E1%BB%A9c%20Th%E1%BA%AFng%20%C4%90%E1%BB%91ng%20%C4%90a%20H%C3%A0%20N%E1%BB%99i" },
    { icon: <Icon name="Store" />, label: "Hệ thống đại lý", action: () => navigateToTopPage("retail") },
  ];

  return (
    <ConfigProvider theme={globalTheme}>
      <Layout className="app-shell">
        <Flex className="top-strip" align="center" justify="space-between" gap={18}><Space><Icon name="MapPin" /><Text>{dict.address}</Text></Space><Text strong><Icon name="Phone" /> {dict.hotline}</Text></Flex>
        <SiteHeader
          dict={dict}
          cartCount={cartCount}
          searchText={searchText}
          setSearchText={setSearchText}
          submitSearch={submitSearch}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <Menu className="nav-bar" mode="horizontal" selectedKeys={[activePage]} items={navItems} onClick={({ key }) => navigateToTopPage(key)} />
        <MobileNavDrawer
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          navItems={navItems}
          menuItems={menuItems}
          activePage={activePage}
          activeCategory={activeCategory}
          loading={loading}
          dict={dict}
          onNavigateTopPage={handleNavigateTopPage}
          onNavigateCategory={handleNavigateCategory}
        />
        <Layout className="main-layout">
          <Sider width={268} className="category-sider" breakpoint="lg" collapsedWidth="0">
            <Flex className="sider-title" align="center" gap={10}><Icon name="Menu" /><Text>{dict.productCategories}</Text></Flex>
            {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : <Menu mode="inline" selectedKeys={[activeCategory]} items={menuItems} onClick={({ key }) => handleNavigateCategory(key)} />}
          </Sider>
          <Content className="content-area">{loading ? <Skeleton active paragraph={{ rows: 10 }} /> : renderPage()}</Content>
        </Layout>
        <Footer className="footer">
          <Row gutter={[20, 20]} align="stretch">
            <Col xs={24} lg={10}>
              <Card className="footer-card footer-company-card" bordered={false}>
                <Image className="footer-logo" preview={false} src="/assets/logo-everon.png" alt="Everon" />
                <List
                  className="footer-contact-list"
                  dataSource={footerContacts}
                  renderItem={(item) => (
                    <List.Item>
                      <Space align="start" size={10}><Icon name={item.icon} /><Text>{item.text}</Text></Space>
                    </List.Item>
                  )}
                />
                <Divider className="footer-divider" />
                <Card className="footer-business-card" size="small" bordered={false}>
                  <Flex vertical gap={8}>
                    <Space align="center"><Icon name="Bookmark" /><Text strong>HỘ KINH DOANH PHẠM QUANG NAM</Text></Space>
                    <Text>Giấy chứng nhận đăng ký kinh doanh</Text>
                    <Space wrap size={8}><Tag color="green">Số: 01N8016282</Tag><Tag color="red">Cấp ngày: 30/4/2020</Tag></Space>
                    <Text>UBND Q. Long Biên - TP. Hà Nội</Text>
                    <Text>Người Đại Diện: Phạm Quang Nam</Text>
                  </Flex>
                </Card>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={7}>
              <Card className="footer-card" bordered={false}>
                <Title level={4}>CHÍNH SÁCH BÁN HÀNG</Title>
                <List className="footer-policy-list" dataSource={footerPolicies} renderItem={(item) => <List.Item><Button type="link" icon={<Icon name="ChevronRight" />} onClick={() => navigateToPolicy(item.slug)}>{item.label}</Button></List.Item>} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={7}>
              <Card className="footer-card" bordered={false}>
                <Title level={4}>LIÊN KẾT NHANH</Title>
                <List
                  className="footer-quick-list"
                  dataSource={footerQuickLinks}
                  renderItem={(item) => (
                    <List.Item>
                      <Button className="footer-quick-button" href={item.href} target={item.href ? "_blank" : undefined} rel={item.href ? "noopener noreferrer" : undefined} onClick={item.action} icon={item.icon}>
                        {item.label}
                      </Button>
                    </List.Item>
                  )}
                />
                <Card className="footer-bct" size="small" bordered={false}>
                  <Space align="center" size={12}><Icon name="BadgeCheck" size={42} /><Text strong>ĐÃ THÔNG BÁO<br />BỘ CÔNG THƯƠNG</Text></Space>
                </Card>
              </Card>
            </Col>
          </Row>
          <Button className="floating-chat floating-messenger" shape="circle" href="https://www.facebook.com/everondongda/" target="_blank" rel="noopener noreferrer" icon={<BrandIcon name="facebook" />} />
          <Button className="floating-hotline" type="primary" href="tel:0966452111">0966.452.111</Button>
          <Button className="floating-zalo" shape="circle" href="https://zalo.me/0966452111" target="_blank" rel="noopener noreferrer">Zalo</Button>
          {buildInfo ? <Text className="build-tag">#{buildInfo.tag}</Text> : null}
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
