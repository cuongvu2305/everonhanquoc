function CategoryPage({ category, products, siblingCategories, langTools }) {
  const { dict, labelCategory, labelProduct } = langTools;
  const relatedCategories = siblingCategories.filter((item) => item !== category);
  const displayCategory = labelCategory(category);
  return (
    <section className="section-panel page-panel category-page">
      <PageHeader
        icon="Layers3"
        title={displayCategory}
        description={dict.categoryDesc(displayCategory)}
        extra={<Space wrap><Tag color="#6f8f7a">{dict.productCount(products.length)}</Tag><Button size="small" href="#retail" icon={<Icon name="PackageOpen" />}>{dict.viewAllProducts}</Button></Space>}
      />
      <ProductGrid products={products} labelProduct={labelProduct} emptyText={dict.emptyCategory} />
      {relatedCategories.length > 0 ? (
        <div className="related-categories">
          <Title level={4}>{dict.relatedCategories}</Title>
          <Space wrap>{relatedCategories.slice(0, 8).map((item) => <Button key={item} href={`#category-${slugifyCategory(item)}`}>{labelCategory(item)}</Button>)}</Space>
        </div>
      ) : null}
    </section>
  );
}

