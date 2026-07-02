const {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  Layout,
  List,
  Menu,
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
const { useEffect, useMemo, useState } = React;

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

function getPageFromHash() {
  const key = getHashKey();
  if (key.startsWith("category-")) return "category";
  return topPages.some((page) => page.key === key) ? key : "home";
}

function getCategorySlugFromHash() {
  const key = getHashKey();
  return key.startsWith("category-") ? key.replace("category-", "") : "";
}

function parsePrice(value) {
  return Number(String(value).replace(/[^0-9]/g, "")) || 0;
}

function formatPrice(value) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function getStoredLang() {
  return localStorage.getItem("everonhanquoc-lang") === "en" ? "en" : "vi";
}

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

function ProductCard({ product, labelProduct }) {
  return (
    <Badge.Ribbon text={product.sale} color="#d71920">
      <Card hoverable className="product-card" cover={<Image preview={false} src={product.image} alt={labelProduct(product)} />}>
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
      <Flex align="flex-start" gap={16}>
        <Flex className="page-hero-icon" align="center" justify="center"><Icon name={icon} size={24} /></Flex>
        <Flex vertical flex={1}>
          <Title level={2}>{title}</Title>
          <Paragraph>{description}</Paragraph>
          {extra ? <Flex className="page-hero-extra" wrap="wrap">{extra}</Flex> : null}
        </Flex>
      </Flex>
    </Card>
  );
}

function ProductGrid({ products, labelProduct, emptyText }) {
  if (products.length === 0) return <Empty description={emptyText} />;
  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => (
        <Col xs={24} sm={12} lg={8} xl={8} key={product.name}>
          <ProductCard product={product} labelProduct={labelProduct} />
        </Col>
      ))}
    </Row>
  );
}

function PolicyGrid({ policies, labelPolicy }) {
  return (
    <Flex className="policy-grid" gap={12} wrap="wrap">
      {policies.map((policy) => <Card key={policy}><Space><Icon name="ShieldCheck" /> <Text>{labelPolicy(policy)}</Text></Space></Card>)}
    </Flex>
  );
}

function HomePage({ activeCategory, filteredProducts, menuItems, setActiveCategory, store, langTools }) {
  const { dict, labelProduct, labelTile, labelPolicy } = langTools;
  return (
    <>
      <Card className="hero">
        <Flex vertical align="flex-start">
          <Tag color="#d71920">{dict.heroTag}</Tag>
          <Title>{dict.heroTitle}</Title>
          <Paragraph>{dict.heroText}</Paragraph>
          <Space wrap>
            <Button type="primary" href="#sale" icon={<Icon name="ShoppingBag" />}>{dict.viewDeals}</Button>
            <Button href="#contact" icon={<Icon name="Truck" />}>{dict.deliveryPolicy}</Button>
          </Space>
        </Flex>
      </Card>

      <Row gutter={[12, 12]} className="tile-grid">
        {store.tiles.map((tile) => (
          <Col xs={12} sm={8} md={8} xl={4} key={tile.name}>
            <Card hoverable className="category-card" cover={<Image preview={false} src={tile.image} alt={labelTile(tile)} />}>
              <Text strong>{labelTile(tile)}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="section-panel">
        <Flex className="section-title" align="center" justify="space-between" gap={16}>
          <Title level={3}>{dict.featuredProducts}</Title>
          <Select
            value={activeCategory}
            onChange={(category) => {
              setActiveCategory(category);
              if (category !== "Tất cả") window.location.hash = `category-${slugifyCategory(category)}`;
            }}
            options={menuItems}
          />
        </Flex>
        <Divider />
        <ProductGrid products={filteredProducts} labelProduct={labelProduct} emptyText={dict.emptyCategory} />
      </Card>

      <PolicyGrid policies={store.policies} labelPolicy={labelPolicy} />
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
        extra={<Space wrap><Tag color="#16842c">{dict.productCount(products.length)}</Tag><Button size="small" href="#retail" icon={<Icon name="PackageOpen" />}>{dict.viewAllProducts}</Button></Space>}
      />
      <ProductGrid products={products} labelProduct={labelProduct} emptyText={dict.emptyCategory} />
      {relatedCategories.length > 0 ? (
        <Flex className="related-categories" vertical>
          <Title level={4}>{dict.relatedCategories}</Title>
          <Space wrap>{relatedCategories.slice(0, 8).map((item) => <Button key={item} href={`#category-${slugifyCategory(item)}`}>{labelCategory(item)}</Button>)}</Space>
        </Flex>
      ) : null}
    </Card>
  );
}

function CheckoutPage({ products, langTools }) {
  const { dict, labelProduct } = langTools;
  const cartItems = products.slice(0, 3).map((product, index) => ({ ...product, quantity: index === 0 ? 1 : 2 }));
  const subtotal = cartItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const shippingFee = subtotal > 3000000 ? 0 : 80000;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + shippingFee - discount;

  return (
    <>
      <PageHeader icon="CreditCard" title={dict.checkoutTitle} description={dict.checkoutDesc} />
      <Steps className="checkout-steps" current={1} items={[{ title: dict.cart }, { title: dict.information }, { title: dict.confirm }]} />
      <Row gutter={[18, 18]} className="checkout-grid">
        <Col xs={24} lg={15}>
          <Card className="checkout-card" title={dict.shippingInfo}>
            <Form layout="vertical">
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12}><Form.Item label={dict.recipientName}><Input placeholder={dict.recipientPlaceholder} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={dict.phone}><Input placeholder={dict.phonePlaceholder} /></Form.Item></Col>
              </Row>
              <Form.Item label={dict.shippingAddress}><Input placeholder={dict.addressPlaceholder} /></Form.Item>
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12}><Form.Item label={dict.province}><Select defaultValue="ha-noi" options={[{ value: "ha-noi", label: dict.all === "All" ? "Hanoi" : "Hà Nội" }, { value: "hcm", label: dict.all === "All" ? "Ho Chi Minh City" : "TP. Hồ Chí Minh" }, { value: "other", label: langTools.dict.all === "All" ? "Other province" : "Tỉnh/Thành khác" }]} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={dict.deliveryTime}><Select defaultValue="today" options={[{ value: "today", label: dict.today }, { value: "tomorrow", label: dict.tomorrow }, { value: "schedule", label: dict.schedule }]} /></Form.Item></Col>
              </Row>
              <Form.Item label={dict.note}><Input.TextArea rows={4} placeholder={dict.notePlaceholder} /></Form.Item>
            </Form>
          </Card>
          <Card className="checkout-card" title={dict.paymentMethod}>
            <Radio.Group defaultValue="cod" className="payment-options"><Radio value="cod">{dict.cod}</Radio><Radio value="transfer">{dict.transfer}</Radio><Radio value="store">{dict.storePayment}</Radio></Radio.Group>
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card className="order-summary" title={dict.orderSummary}>
            <List itemLayout="horizontal" dataSource={cartItems} renderItem={(item) => <List.Item><List.Item.Meta avatar={<Image className="cart-thumb" preview={false} src={item.image} alt={labelProduct(item)} />} title={labelProduct(item)} description={`${dict.quantity}: ${item.quantity}`} /><Text strong>{formatPrice(parsePrice(item.price) * item.quantity)}</Text></List.Item>} />
            <Divider />
            <Flex className="summary-row" align="center" justify="space-between" gap={12}><Text>{dict.subtotal}</Text><Text>{formatPrice(subtotal)}</Text></Flex>
            <Flex className="summary-row" align="center" justify="space-between" gap={12}><Text>{dict.shippingFee}</Text><Text>{shippingFee === 0 ? dict.freeShipping : formatPrice(shippingFee)}</Text></Flex>
            <Flex className="summary-row" align="center" justify="space-between" gap={12}><Text>{dict.discount}</Text><Text>-{formatPrice(discount)}</Text></Flex>
            <Flex className="summary-row total-row" align="center" justify="space-between" gap={12}><Text strong>{dict.total}</Text><Text strong>{formatPrice(total)}</Text></Flex>
            <Button block type="primary" size="large" icon={<Icon name="CheckCircle2" />}>{dict.placeOrder}</Button>
            <Button block href="#retail" className="continue-shopping">{dict.continueShopping}</Button>
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
  const [store, setStore] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [activePage, setActivePage] = useState(getPageFromHash());
  const [activeCategorySlug, setActiveCategorySlug] = useState(getCategorySlugFromHash());
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState(getStoredLang());
  const [storeLoading, setStoreLoading] = useState(true);
  const [localeLoading, setLocaleLoading] = useState(true);
  const [localeDict, setLocaleDict] = useState(null);
  const langTools = useI18n(lang, localeDict);
  const { dict, labelCategory } = langTools;

  useEffect(() => {
    localStorage.setItem("everonhanquoc-lang", lang);
    document.documentElement.lang = lang;
    setLocaleLoading(true);
    fetch(`/locales/${lang}.json?v=locale-1`)
      .then((response) => { if (!response.ok) throw new Error("Locale error"); return response.json(); })
      .then(setLocaleDict)
      .catch(() => message.error(lang === "en" ? "Could not load locale data" : "Không tải được dữ liệu ngôn ngữ"))
      .finally(() => setLocaleLoading(false));
  }, [lang]);

  useEffect(() => {
    const updatePage = () => { setActivePage(getPageFromHash()); setActiveCategorySlug(getCategorySlugFromHash()); };
    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);

  useEffect(() => {
    fetch("/api/storefront")
      .then((response) => { if (!response.ok) throw new Error("API error"); return response.json(); })
      .then(setStore)
      .catch(() => message.error(lang === "en" ? "Could not load storefront data" : "Không tải được API storefront"))
      .finally(() => setStoreLoading(false));
  }, [lang]);

  useEffect(() => {
    if (!store || activePage !== "category") return;
    const category = store.categories.find((item) => slugifyCategory(item) === activeCategorySlug);
    setActiveCategory(category ?? "Tất cả");
  }, [activeCategorySlug, activePage, store]);

  const loading = storeLoading || localeLoading;
  const products = store?.products ?? [];
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const displayName = langTools.labelProduct(product).toLowerCase();
      const matchCategory = activeCategory === "Tất cả" || product.category === activeCategory;
      const matchQuery = normalizedQuery.length === 0 || product.name.toLowerCase().includes(normalizedQuery) || displayName.includes(normalizedQuery);
      return matchCategory && matchQuery;
    });
  }, [activeCategory, products, query, lang]);

  const menuItems = useMemo(() => ["Tất cả", ...(store?.categories ?? [])].map((category) => ({ key: category, label: category === "Tất cả" ? dict.all : labelCategory(category) })), [store, lang]);
  const navItems = useMemo(() => topPages.map((page) => ({ key: page.key, icon: <Icon name={page.icon} size={16} />, label: dict.topPages[page.key] })), [dict]);
  const saleProducts = useMemo(() => products.filter((product) => product.sale !== "-"), [products]);
  const categoryPage = useMemo(() => {
    if (!store) return null;
    const category = store.categories.find((item) => slugifyCategory(item) === activeCategorySlug);
    if (!category) return null;
    return { category, products: products.filter((product) => product.category === category) };
  }, [activeCategorySlug, products, store]);

  const renderPage = () => {
    if (!store) return null;
    if (activePage === "news") return <NewsPage dict={dict} />;
    if (activePage === "sale") return <SalePage products={saleProducts} langTools={langTools} />;
    if (activePage === "retail") return <RetailPage products={products} langTools={langTools} />;
    if (activePage === "contact") return <ContactPage dict={dict} />;
    if (activePage === "about") return <AboutPage dict={dict} />;
    if (activePage === "checkout") return <CheckoutPage products={products} langTools={langTools} />;
    if (activePage === "category" && categoryPage) return <CategoryPage category={categoryPage.category} products={categoryPage.products} siblingCategories={store.categories} langTools={langTools} />;
    return <HomePage activeCategory={activeCategory} filteredProducts={filteredProducts} menuItems={menuItems} setActiveCategory={setActiveCategory} store={store} langTools={langTools} />;
  };

  return (
    <ConfigProvider theme={{ token: { borderRadius: 6, colorPrimary: "#16842c", colorInfo: "#16842c", colorSuccess: "#16842c", colorError: "#d71920", colorText: "#243126", colorTextSecondary: "#657268", colorBorder: "#d9e5dc", fontFamily: "Arial, Helvetica, sans-serif" } }}>
      <Layout className="app-shell">
        <Flex className="top-strip" align="center" justify="space-between" gap={18}><Space><Icon name="MapPin" /><Text>{dict.address}</Text></Space><Text strong><Icon name="Phone" /> {dict.hotline}</Text></Flex>
        <Header className="site-header">
          <Button className="brand" type="link" href="#home" aria-label="Everon Hàn Quốc"><Image preview={false} src="/assets/logo-everon.png" alt="Everon Hàn Quốc" /></Button>
          <Input.Search className="search-box" allowClear enterButton={<Button type="primary" icon={<Icon name="Search" />}>{dict.searchButton}</Button>} placeholder={dict.searchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} />
          <Space className="header-actions">
            <Button className={lang === "vi" ? "lang-active" : ""} onClick={() => setLang("vi")}>VI</Button>
            <Button className={lang === "en" ? "lang-active" : ""} onClick={() => setLang("en")}>EN</Button>
            <Button
              aria-label="Facebook"
              href="https://www.facebook.com/everondongda/"
              icon={<BrandIcon name="facebook" />}
              shape="circle"
              target="_blank"
              rel="noopener noreferrer"
            />
            <Button
              aria-label="YouTube"
              href="https://www.youtube.com/channel/UCW8R-hC2rCWSm-T2fFyQcFw"
              icon={<BrandIcon name="youtube" />}
              shape="circle"
              target="_blank"
              rel="noopener noreferrer"
            />
            <Badge count={3}><Button href="#checkout" shape="circle" icon={<Icon name="ShoppingCart" />} /></Badge>
          </Space>
        </Header>
        <Menu className="nav-bar" mode="horizontal" selectedKeys={[activePage]} items={navItems} onClick={({ key }) => { window.location.hash = key; }} />
        <Layout className="main-layout">
          <Sider width={268} className="category-sider" breakpoint="lg" collapsedWidth="0">
            <Flex className="sider-title" align="center" gap={10}><Icon name="Menu" /><Text>{dict.productCategories}</Text></Flex>
            {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : <Menu mode="inline" selectedKeys={[activeCategory]} items={menuItems} onClick={({ key }) => { setActiveCategory(key); window.location.hash = key === "Tất cả" ? "home" : `category-${slugifyCategory(key)}`; }} />}
          </Sider>
          <Content className="content-area">{loading ? <Skeleton active paragraph={{ rows: 10 }} /> : <>{renderPage()}<Alert className="backend-note" type="info" showIcon message={dict.backendNote} /></>}</Content>
        </Layout>
        <Footer className="footer"><Row gutter={[24, 24]}><Col xs={24} md={10}><Title level={4}>{dict.heroTitle}</Title><Paragraph>{dict.footerText}</Paragraph></Col><Col xs={24} md={7}><Title level={5}>{dict.storeInfo}</Title><Paragraph>{dict.address}</Paragraph><Paragraph>{dict.hotline}</Paragraph></Col><Col xs={24} md={7}><Title level={5}>{dict.tech}</Title><Paragraph>Python HTTP API</Paragraph><Paragraph>React JSX + Ant Design + Lucide</Paragraph></Col></Row></Footer>
      </Layout>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
