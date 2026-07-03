function ProductCard({ product, labelProduct }) {
  return (
    <Badge.Ribbon text={product.sale} color="#d71920">
      <Card hoverable className="product-card" onClick={() => navigateToProduct(product)} cover={<Image preview={false} src={product.image} alt={labelProduct(product)} />}>
        <Title level={5}>{labelProduct(product)}</Title>
        <Space wrap>
          <Text className="price">{product.price}</Text>
          <Text delete type="secondary">{product.oldPrice}</Text>
        </Space>
      </Card>
    </Badge.Ribbon>
  );
}

