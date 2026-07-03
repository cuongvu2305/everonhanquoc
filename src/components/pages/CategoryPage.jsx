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
        extra={<Space wrap><Tag color="#16842c">{dict.productCount(products.length)}</Tag><Button size="small" onClick={() => navigateToTopPage("retail")} icon={<Icon name="PackageOpen" />}>{dict.viewAllProducts}</Button></Space>}
      />
      <ProductGrid products={products} labelProduct={labelProduct} emptyText={dict.emptyCategory} />
      {relatedCategories.length > 0 ? (
        <Flex className="related-categories" vertical>
          <Title level={4}>{dict.relatedCategories}</Title>
          <Space wrap>{relatedCategories.slice(0, 8).map((item) => <Button key={item} onClick={() => navigateToCategory(item)}>{labelCategory(item)}</Button>)}</Space>
        </Flex>
      ) : null}
    </Card>
  );
}
