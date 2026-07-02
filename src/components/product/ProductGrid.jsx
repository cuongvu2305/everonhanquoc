function ProductGrid({ products, labelProduct, emptyText }) {
  if (products.length === 0) return <Empty description={emptyText} />;
  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => (
        <Col xs={24} sm={12} lg={8} xl={8} key={product.name}>
          <ProductCard product={product} labelProduct={labelProduct} />
        </Col>
      ))}
    </Row>
  );
}

