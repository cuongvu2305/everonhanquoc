import { Badge, Button, Card, Col, ConfigProvider, Content, Divider, Flex, Footer, Image, Layout, List, Menu, message, Row, Skeleton, Sider, Space, Tag, Text, Title, useEffect, useMemo, useState } from "./globals.jsx";
import { globalTheme } from "../lib/antd-theme.jsx";
import { Icon } from "../components/icons/Icon.jsx";
import { MobileNavDrawer } from "../components/layout/MobileNavDrawer.jsx";
import { MobileTabBar, MobileTrustStrip } from "../components/layout/MobileTabBar.jsx";
import { SiteHeader } from "../components/layout/SiteHeader.jsx";
import { ShowroomList, toTelHref } from "../components/layout/ShowroomList.jsx";
import { AboutPage } from "../components/pages/AboutPage.jsx";
import { CategoryPage } from "../components/pages/CategoryPage.jsx";
import { CheckoutPage } from "../components/pages/CheckoutPage.jsx";
import { ContactPage } from "../components/pages/ContactPage.jsx";
import { HomePage } from "../components/pages/HomePage.jsx";
import { NewsPage } from "../components/pages/NewsPage.jsx";
import { policyPages, PolicyPage } from "../components/pages/PolicyPage.jsx";
import { ProductDetailPage } from "../components/pages/ProductDetailPage.jsx";
import { RetailPage } from "../components/pages/RetailPage.jsx";
import { SalePage } from "../components/pages/SalePage.jsx";
import { SearchPage } from "../components/pages/SearchPage.jsx";
import { topPages } from "../constants/navigation.jsx";
import { useI18n } from "../hooks/use-i18n.jsx";
import { useLocale, useStorefront } from "../hooks/use-storefront.jsx";
import { isOutOfStock } from "../lib/product.js";
import { buildMainNavItems, FOOTER_PAGE_KEYS, mainNavSelectedKeys, parseNavKey } from "../lib/navigation.js";
import { cartKey } from "../lib/variants.js";
import { buildSearchUrl, getCategorySlugFromHash, getPageFromHash, getPolicySlugFromLocation, getProductSlugFromLocation, getSearchQueryFromLocation, getStoredCart, navigateToCategory, navigateToPolicy, navigateToTopPage, slugifyCategory, slugifyProduct, storeCart } from "../lib/runtime.js";

const MESSENGER_URL = "https://www.messenger.com/t/441239679606397/?messaging_source=source%3Apages%3Amessage_shortlink&source_id=1441792&recurring_notification=0";
const ZALO_URL = "https://zalo.me/0966452111";
const SOCIAL_LINKS = [
  { brand: "facebook", label: "Facebook", href: "https://www.facebook.com/everondongda/" },
  { brand: "youtube", label: "YouTube", href: "https://www.youtube.com/channel/UCW8R-hC2rCWSm-T2fFyQcFw" },
];

export default function App() {
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
  const pageNavItem = (page) => ({ key: page.key, icon: <Icon name={page.icon} size={16} />, label: dict.topPages[page.key] });
  // Full page list: used by the mobile drawer and as the desktop bar when no category groups exist.
  const navItems = useMemo(() => topPages.map(pageNavItem), [dict]);
  // Desktop bar: Trang chủ | category groups (dropdowns) | Tin tức | Liên hệ.
  const mainNavItems = buildMainNavItems({ groups: store?.categoryGroups, pages: topPages, pageItem: pageNavItem, labelCategory }) ?? navItems;
  // Touch screens have no hover: open category dropdowns on tap instead.
  const isTouchScreen = typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches === true;
  const handleMainNavClick = ({ key }) => {
    const target = parseNavKey(key);
    if (target.type === "category") handleNavigateCategory(target.value);
    else if (target.type === "page") navigateToTopPage(target.value);
  };
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
  // A cart line is a product plus, when chosen on the detail page, a size/price variant.
  const cartItems = useMemo(() => cartEntries.map((entry) => {
    const product = products.find((item) => slugifyProduct(item) === entry.slug);
    if (!product) return null;
    const variant = entry.variantId ? { id: entry.variantId, name: entry.variantName, size: entry.size } : null;
    return {
      ...product,
      slug: entry.slug,
      cartKey: cartKey(entry.slug, entry.variantId),
      quantity: entry.quantity,
      variant,
      price: variant ? entry.price : product.price,
      oldPrice: variant ? entry.oldPrice : product.oldPrice,
    };
  }).filter(Boolean), [cartEntries, products]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const entryKey = (entry) => cartKey(entry.slug, entry.variantId);
  const newCartEntry = (product, variant) => ({
    slug: slugifyProduct(product),
    quantity: 1,
    ...(variant
      ? { variantId: variant.id, variantName: variant.name, size: variant.size, price: variant.price, ...(variant.oldPrice ? { oldPrice: variant.oldPrice } : {}) }
      : {}),
  });

  const addToCart = (product, variant) => {
    // The detail page disables the button too; this guards any other caller.
    if (isOutOfStock(product)) return;
    const entry = newCartEntry(product, variant);
    const key = entryKey(entry);
    setCartEntries((current) => (current.some((item) => entryKey(item) === key)
      ? current.map((item) => (entryKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item))
      : [...current, entry]));
    message.success(dict.addedToCart);
  };

  // "Mua ngay": make sure this product/size is in the cart (without bumping an existing quantity) and go to checkout.
  const buyNow = (product, variant) => {
    if (isOutOfStock(product)) return;
    const entry = newCartEntry(product, variant);
    const key = entryKey(entry);
    setCartEntries((current) => (current.some((item) => entryKey(item) === key) ? current : [...current, entry]));
    navigateToTopPage("checkout");
  };

  const updateCartQuantity = (key, quantity) => {
    setCartEntries((current) => quantity <= 0 ? current.filter((item) => entryKey(item) !== key) : current.map((item) => entryKey(item) === key ? { ...item, quantity } : item));
  };

  const removeCartItem = (key) => {
    setCartEntries((current) => current.filter((item) => entryKey(item) !== key));
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
    if (activePage === "product") return <ProductDetailPage product={productPage?.product} relatedProducts={productPage?.relatedProducts ?? []} langTools={langTools} onAddToCart={addToCart} onBuyNow={buyNow} />;
    if (activePage === "policy") return <PolicyPage slug={activePolicySlug} />;
    if (activePage === "category" && categoryPage) return <CategoryPage key={categoryPage.category} category={categoryPage.category} products={categoryPage.products} siblingCategories={store.categories} langTools={langTools} />;
    return <HomePage activeCategory={activeCategory} filteredProducts={filteredProducts} menuItems={menuItems} setActiveCategory={setActiveCategory} store={store} langTools={langTools} />;
  };
  const footerPolicies = policyPages.map((item) => ({
    label: item.title,
    slug: item.slug,
    active: activePage === "policy" && activePolicySlug === item.slug,
  }));
  const footerContacts = [
    { icon: "MapPin", text: "Địa chỉ: 234 Tôn Đức Thắng, Q. Đống Đa, Tp. Hà Nội" },
    { icon: "PhoneCall", text: "Hotline: 024.3999.4555 - 0966.452.111" },
    { icon: "Mail", text: "Email: everonngogiatu@gmail.com" },
    { icon: "Globe", text: "Website: http://everonlongbien.com.vn/" },
  ];
  const footerQuickLinks = [
    // Pages that left the desktop bar when category groups took their place.
    ...(store?.categoryGroups?.length
      ? FOOTER_PAGE_KEYS.map((key) => ({ label: dict.topPages[key], action: () => navigateToTopPage(key) }))
      : []),
    { label: "Facebook", href: "https://www.facebook.com/everondongda/" },
    { label: "Map", href: "https://www.google.com/maps/search/?api=1&query=234%20T%C3%B4n%20%C4%90%E1%BB%A9c%20Th%E1%BA%AFng%20%C4%90%E1%BB%91ng%20%C4%90a%20H%C3%A0%20N%E1%BB%99i" },
  ];

  return (
    <ConfigProvider theme={globalTheme}>
      <Layout className="app-shell">
        <div className="sticky-navigation">
          <SiteHeader
            dict={dict}
            searchText={searchText}
            setSearchText={setSearchText}
            submitSearch={submitSearch}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            mapUrl={store?.showrooms?.[0]?.mapUrl}
            hotlineHref={toTelHref(store?.showrooms?.[0]?.phone)}
            products={products}
            labelProduct={langTools.labelProduct}
          />
          <div className="nav-bar-row">
            <Menu
              className="nav-bar"
              mode="horizontal"
              // Keep all 7 entries visible at every width (the bar scrolls sideways on small screens)
              // instead of letting Ant Design fold them into a "…" item.
              disabledOverflow
              triggerSubMenuAction={isTouchScreen ? "click" : "hover"}
              selectedKeys={mainNavSelectedKeys({ activePage, activeCategory })}
              items={mainNavItems}
              onClick={handleMainNavClick}
            />
            <Badge className="nav-cart-badge" count={cartCount} showZero size="small">
              <Button className="nav-cart" shape="circle" aria-label={dict.cart} icon={<Icon name="ShoppingCart" size={18} />} onClick={() => navigateToTopPage("checkout")} />
            </Badge>
          </div>
        </div>
        <MobileTrustStrip dict={dict} showroom={store?.showrooms?.[0]} />
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
                <List
                  className="footer-policy-list"
                  dataSource={footerPolicies}
                  renderItem={(item) => (
                    <List.Item className={item.active ? "is-active" : ""}>
                      <Button className="footer-policy-button" type="text" onClick={() => navigateToPolicy(item.slug)}>
                        {item.label}
                      </Button>
                    </List.Item>
                  )}
                />
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
                      <Button className="footer-quick-button" href={item.href} target={item.href ? "_blank" : undefined} rel={item.href ? "noopener noreferrer" : undefined} onClick={item.action}>
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
            {/* One showroom is already covered by the address in footerContacts; list only branches. */}
            {store?.showrooms?.length > 1 ? (
              <Col xs={24}>
                <Card className="footer-card footer-showroom-card" bordered={false}>
                  <Title level={4}>{dict.showroomFooterTitle}</Title>
                  <ShowroomList showrooms={store.showrooms} dict={dict} variant="compact" />
                </Card>
              </Col>
            ) : null}
          </Row>
          {(buildInfo?.releaseTag || buildInfo?.tag) && (
            <Text className="build-tag">{buildInfo.releaseTag || buildInfo.tag}</Text>
          )}
          <Button className="floating-chat floating-messenger" shape="circle" href={MESSENGER_URL} target="_blank" rel="noopener noreferrer">
            <img src="/assets/messenger-logo.png" alt="" aria-hidden="true" />
          </Button>
          <Button className="floating-hotline" type="primary" href="tel:0966452111">0966.452.111</Button>
          <Button className="floating-zalo" shape="circle" href={ZALO_URL} target="_blank" rel="noopener noreferrer">
            <img src="/assets/zalo-logo.png" alt="" aria-hidden="true" />
          </Button>
        </Footer>
        <MobileTabBar
          dict={dict}
          activePage={activePage}
          cartCount={cartCount}
          categoryGroups={store?.categoryGroups ?? []}
          labelCategory={labelCategory}
          socialLinks={SOCIAL_LINKS}
          contact={{
            phone: store?.showrooms?.[0]?.phone,
            telHref: toTelHref(store?.showrooms?.[0]?.phone),
            zaloHref: ZALO_URL,
            messengerHref: MESSENGER_URL,
            mapUrl: store?.showrooms?.[0]?.mapUrl,
          }}
        />
      </Layout>
    </ConfigProvider>
  );
}
