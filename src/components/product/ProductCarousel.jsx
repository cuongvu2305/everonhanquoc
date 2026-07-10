function ProductCarousel({ title, products, labelProduct, emptyText, onViewAll }) {
  const scrollerRef = useRef(null);
  const scrollProducts = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.max(320, node.clientWidth * 0.88), behavior: "smooth" });
  };

  return (
    <Card className="product-carousel-section">
      <div className="product-carousel-header">
        <Title level={4} className="product-carousel-title">{title}</Title>
        <Space className="product-carousel-actions" wrap>
          {onViewAll ? <Button size="small" onClick={onViewAll}>{dictViewAllLabel()}</Button> : null}
          <Button aria-label={`Xem sản phẩm trước trong ${title}`} icon={<Icon name="ChevronLeft" />} onClick={() => scrollProducts(-1)} />
          <Button aria-label={`Xem sản phẩm tiếp trong ${title}`} icon={<Icon name="ChevronRight" />} onClick={() => scrollProducts(1)} />
        </Space>
      </div>
      {products.length === 0 ? (
        <Empty description={emptyText} />
      ) : (
        <div className="product-carousel-track" ref={scrollerRef}>
          {products.map((product) => (
            <div className="product-carousel-item" key={product.sourceUrl || product.name}>
              <ProductCard product={product} labelProduct={labelProduct} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function dictViewAllLabel() {
  return "Xem tất cả";
}
