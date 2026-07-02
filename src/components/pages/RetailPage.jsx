function RetailPage({ products, langTools }) {
  const { dict, labelProduct } = langTools;
  return <section className="section-panel page-panel"><PageHeader icon="PackageOpen" title={dict.retailTitle} description={dict.retailDesc} /><ProductGrid products={products} labelProduct={labelProduct} emptyText={dict.emptyCategory} /></section>;
}

