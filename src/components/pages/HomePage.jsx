function HomePage({ activeCategory, filteredProducts, menuItems, setActiveCategory, store, langTools }) {
  const { dict, labelProduct, labelTile, labelPolicy } = langTools;
  return (
    <>
      <section className="hero">
        <div>
          <Tag color="#c9828f">{dict.heroTag}</Tag>
          <Title>{dict.heroTitle}</Title>
          <Paragraph>{dict.heroText}</Paragraph>
          <Space wrap>
            <Button type="primary" href="#sale" icon={<Icon name="ShoppingBag" />}>{dict.viewDeals}</Button>
            <Button href="#contact" icon={<Icon name="Truck" />}>{dict.deliveryPolicy}</Button>
          </Space>
        </div>
      </section>

      <Row gutter={[12, 12]} className="tile-grid">
        {store.tiles.map((tile) => (
          <Col xs={12} sm={8} md={8} xl={4} key={tile.name}>
            <Card hoverable className="category-card" cover={<img src={tile.image} alt="" />}>
              <Text strong>{labelTile(tile)}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <section className="section-panel">
        <div className="section-title">
          <Title level={3}>{dict.featuredProducts}</Title>
          <Select
            value={activeCategory}
            onChange={(category) => {
              setActiveCategory(category);
              if (category !== "Tất cả") window.location.hash = `category-${slugifyCategory(category)}`;
            }}
            options={menuItems}
          />
        </div>
        <Divider />
        <ProductGrid products={filteredProducts} labelProduct={labelProduct} emptyText={dict.emptyCategory} />
      </section>

      <PolicyGrid policies={store.policies} labelPolicy={labelPolicy} />
    </>
  );
}

