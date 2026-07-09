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
