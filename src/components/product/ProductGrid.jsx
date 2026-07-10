function ProductGrid({ products, labelProduct, emptyText, paginated = false, pageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const productListKey = products.map((product) => product.sourceUrl || product.name).join("|");

  useEffect(() => {
    setCurrentPage(1);
  }, [productListKey, pageSize]);

  if (products.length === 0) return <Empty description={emptyText} />;
  const visibleProducts = paginated ? products.slice((currentPage - 1) * pageSize, currentPage * pageSize) : products;
  const renderPaginationItem = (page, type, originalElement) => {
    if (type === "prev" || type === "next") return originalElement;
    if (type === "page" && page === currentPage) return originalElement;
    return null;
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        {visibleProducts.map((product) => (
          <Col xs={24} sm={12} lg={8} xl={8} key={product.sourceUrl || product.name}>
            <ProductCard product={product} labelProduct={labelProduct} />
          </Col>
        ))}
      </Row>
      {paginated && products.length > pageSize ? (
        <Flex className="product-pagination" justify="center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={products.length}
            showSizeChanger={false}
            itemRender={renderPaginationItem}
            onChange={setCurrentPage}
          />
        </Flex>
      ) : null}
    </>
  );
}
