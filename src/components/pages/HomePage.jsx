function HomePage({ activeCategory, filteredProducts, menuItems, setActiveCategory, store, langTools }) {
  const { dict, labelProduct, labelTile } = langTools;
  const tileCategoryMap = {};
  const openTileCategory = (tileName) => {
    navigateToCategory(tileCategoryMap[tileName] ?? tileName);
  };
  const productsByCategory = (category) => store.products.filter((product) => product.category === category || product.categories?.includes(category));
  return (
    <>
      <Card className="hero">
        <Flex vertical align="flex-start">
          <Tag color="#d71920">{dict.heroTag}</Tag>
          <Title>{dict.heroTitle}</Title>
          <Paragraph>{dict.heroText}</Paragraph>
          <Space wrap>
            <Button type="primary" onClick={() => navigateToTopPage("sale")} icon={<Icon name="ShoppingBag" />}>{dict.viewDeals}</Button>
            <Button onClick={() => navigateToTopPage("contact")} icon={<Icon name="Truck" />}>{dict.deliveryPolicy}</Button>
          </Space>
        </Flex>
      </Card>

      <Row gutter={[12, 12]} className="tile-grid">
        {store.tiles.map((tile) => (
          <Col xs={12} sm={8} md={8} xl={4} key={tile.name}>
            <Card
              hoverable
              className="category-card"
              onClick={() => openTileCategory(tile.name)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openTileCategory(tile.name);
                }
              }}
              role="button"
              tabIndex={0}
              cover={<Image preview={false} src={tile.image} alt={labelTile(tile)} />}
            >
              <Button type="link" className="category-card-title" onClick={(event) => { event.stopPropagation(); openTileCategory(tile.name); }}>
                {labelTile(tile)}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

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
