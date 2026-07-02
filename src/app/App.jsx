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
