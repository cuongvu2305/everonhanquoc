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
