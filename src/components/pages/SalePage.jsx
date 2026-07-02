function SalePage({ products, langTools }) {
  const { dict, labelProduct } = langTools;
  return <section className="section-panel page-panel"><PageHeader icon="BadgePercent" title={dict.saleTitle} description={dict.saleDesc} /><ProductGrid products={products} labelProduct={labelProduct} emptyText={dict.emptyCategory} /></section>;
}

