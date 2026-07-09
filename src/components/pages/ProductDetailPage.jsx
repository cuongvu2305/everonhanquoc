function ProductDetailPage({ product, relatedProducts, langTools, onAddToCart }) {
  const { dict, labelCategory, labelProduct } = langTools;

  if (!product) {
    return (
      <Card className="section-panel page-panel">
        <Empty description={dict.productNotFound} />
      </Card>
    );
  }

  return (
    <Card className="section-panel page-panel product-detail-page">
      <Row gutter={[24, 24]} align="top">
        <Col xs={24} lg={11}>
          <Image className="product-detail-image" preview={false} src={product.image} alt={labelProduct(product)} />
        </Col>
        <Col xs={24} lg={13}>
          <Flex vertical gap={14}>
            <Space wrap>
              <Tag color="#16842c">{labelCategory(product.category)}</Tag>
              <Tag color="#d71920">{product.sale}</Tag>
            </Space>
            <Title level={2}>{labelProduct(product)}</Title>
            <Space align="baseline" wrap>
              <Text className="product-detail-price">{product.price}</Text>
              <Text delete type="secondary">{product.oldPrice}</Text>
            </Space>
            <Space wrap className="product-detail-actions">
              <Button type="primary" size="large" icon={<Icon name="ShoppingCart" />} onClick={() => onAddToCart(product)}>
                {dict.addToCart}
              </Button>
              <Button size="large" onClick={() => navigateToTopPage("contact")} icon={<Icon name="PhoneCall" />}>
                {dict.contactConsulting}
              </Button>
            </Space>
            <Paragraph className="product-detail-desc">{dict.productDetailDesc}</Paragraph>
            <div className="product-detail-info">
              <Flex vertical gap={10}>
                <Flex justify="space-between" gap={16}><Text type="secondary">{dict.productCode}</Text><Text strong>{extractProductCode(product)}</Text></Flex>
                <Flex justify="space-between" gap={16}><Text type="secondary">{dict.productCategory}</Text><Button type="link" onClick={() => navigateToCategory(product.category)}>{labelCategory(product.category)}</Button></Flex>
                <Flex justify="space-between" gap={16}><Text type="secondary">{dict.productStatus}</Text><Text>{dict.inStock}</Text></Flex>
              </Flex>
            </div>
          </Flex>
        </Col>
      </Row>

      {relatedProducts.length > 0 ? (
        <section className="related-products">
          <Title level={3}>{dict.relatedProducts}</Title>
          <ProductGrid products={relatedProducts} labelProduct={labelProduct} emptyText={dict.emptyCategory} />
        </section>
      ) : null}
    </Card>
  );
}
