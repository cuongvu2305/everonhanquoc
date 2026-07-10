function ProductCarousel({ title, products, labelProduct, emptyText, onTitleClick }) {
  const scrollerRef = useRef(null);
  const scrollProducts = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.max(320, node.clientWidth * 0.88), behavior: "smooth" });
  };

  return (
    <Card className="product-carousel-section">
      <div className="product-carousel-header">
        <button className="product-carousel-title-button" type="button" onClick={onTitleClick}>
          <span className="product-carousel-title">{title}</span>
        </button>
      </div>
      {products.length === 0 ? (
        <Empty description={emptyText} />
      ) : (
        <>
          <div className="product-carousel-track" ref={scrollerRef}>
            {products.map((product) => (
              <div className="product-carousel-item" key={product.sourceUrl || product.name}>
                <ProductCard product={product} labelProduct={labelProduct} />
              </div>
            ))}
          </div>
          <Space className="product-carousel-actions" wrap>
            <Button aria-label={`Xem sản phẩm trước trong ${title}`} icon={<Icon name="ChevronLeft" />} onClick={() => scrollProducts(-1)} />
            <Button aria-label={`Xem sản phẩm tiếp trong ${title}`} icon={<Icon name="ChevronRight" />} onClick={() => scrollProducts(1)} />
          </Space>
        </>
      )}
    </Card>
  );
}
