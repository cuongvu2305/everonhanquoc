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

