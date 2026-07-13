import { Col, Empty, Flex, Pagination, Row, useEffect, useState } from "../../app/globals.jsx";
import { ProductCard } from "./ProductCard.jsx";

export function ProductGrid({ products, labelProduct, emptyText, paginated = false, pageSize = 9 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const productListKey = products.map((product) => product.sourceUrl || product.name).join("|");

  useEffect(() => {
    setCurrentPage(1);
  }, [productListKey, pageSize]);

  if (products.length === 0) return <Empty description={emptyText} />;
  const visibleProducts = paginated ? products.slice((currentPage - 1) * pageSize, currentPage * pageSize) : products;
  const placeholders = paginated && visibleProducts.length < pageSize ? Array.from({ length: pageSize - visibleProducts.length }) : [];
  const placeholderProduct = visibleProducts[0] || products[0];

  return (
    <>
      <Row gutter={[16, 16]}>
        {visibleProducts.map((product) => (
          <Col xs={24} sm={12} lg={8} xl={8} key={product.sourceUrl || product.name}>
            <ProductCard product={product} labelProduct={labelProduct} />
          </Col>
        ))}
        {placeholderProduct ? placeholders.map((_, index) => (
          <Col xs={24} sm={12} lg={8} xl={8} key={`placeholder-${index}`}>
            <div className="product-grid-placeholder" aria-hidden="true">
              <ProductCard product={placeholderProduct} labelProduct={labelProduct} />
            </div>
          </Col>
        )) : null}
      </Row>
      {paginated && products.length > pageSize ? (
        <Flex className="product-pagination" justify="center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={products.length}
            simple
            showSizeChanger={false}
            onChange={setCurrentPage}
          />
        </Flex>
      ) : null}
    </>
  );
}
