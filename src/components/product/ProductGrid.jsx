function ProductGrid({ products, labelProduct, emptyText, paginated = false, pageSize = 9 }) {
  const [currentPage, setCurrentPage] = useState(1);
  if (products.length === 0) return <Empty description={emptyText} />;
  const visibleProducts = paginated ? products.slice((currentPage - 1) * pageSize, currentPage * pageSize) : products;
  return (
    <>
      <Row gutter={[16, 16]}>
        {visibleProducts.map((product) => (
          <Col xs={12} sm={12} lg={8} xl={8} key={product.sourceUrl || product.name}>
            <ProductCard product={product} labelProduct={labelProduct} />
          </Col>
        ))}
      </Row>
      {paginated && products.length > pageSize ? (
        <Flex className="product-pagination" justify="center">
          <Pagination current={currentPage} pageSize={pageSize} total={products.length} showSizeChanger={false} onChange={setCurrentPage} />
        </Flex>
      ) : null}
    </>
  );
}
