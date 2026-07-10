function SearchPage({ products, query, langTools }) {
  const { dict, labelProduct } = langTools;
  const normalizedQuery = query.trim().toLowerCase();
  const results = products.filter((product) => {
    const displayName = labelProduct(product).toLowerCase();
    const category = product.category.toLowerCase();
    return normalizedQuery.length > 0 && (product.name.toLowerCase().includes(normalizedQuery) || displayName.includes(normalizedQuery) || category.includes(normalizedQuery));
  });

  return (
    <Card className="section-panel page-panel search-page">
      <PageHeader
        icon="Search"
        title={dict.searchResultsTitle}
        description={dict.searchResultsDesc.replace("{query}", query || "...")}
        extra={
          <Space wrap size={[8, 8]}>
            <Tag color="#16842c">{dict.productCount(results.length)}</Tag>
            <Button size="small" href="/" icon={<Icon name="Home" />}>
              {dict.topPages.home}
            </Button>
          </Space>
        }
      />
      <ProductGrid products={results} labelProduct={labelProduct} emptyText={dict.emptySearchResults} paginated />
    </Card>
  );
}
