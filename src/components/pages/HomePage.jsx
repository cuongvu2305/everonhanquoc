function HomePage({ activeCategory, filteredProducts, menuItems, setActiveCategory, store, langTools }) {
  const { dict, labelProduct, labelTile, labelPolicy } = langTools;
  const tileCategoryMap = {
    "Đệm lò xo": "Đệm lò xo Kingkoil",
    "Đệm bông ép": "Đệm bông ép",
    "Chăn ga gối": "Chăn - ga - gối Everon",
    "Ruột chăn": "Ruột chăn Everon",
    "Ruột gối": "Ruột gối Everon",
    "Đệm cao su": "Đệm cao su",
  };
  const openTileCategory = (tileName) => {
    navigateToCategory(tileCategoryMap[tileName] ?? tileName);
  };
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

      <Card className="section-panel">
        <Flex className="section-title" align="center" justify="space-between" gap={16}>
          <Title level={3}>{dict.featuredProducts}</Title>
          <Select
            value={activeCategory}
            onChange={(category) => {
              setActiveCategory(category);
              if (category === "Tất cả") {
                navigateToTopPage("home");
                return;
              }
              navigateToCategory(category);
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
