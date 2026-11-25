import { Badge, Card, Image, Rate, Space, Text, Title } from "../../app/globals.jsx";
import { formatRatingLabel, getProductRating, isOutOfStock } from "../../lib/product.js";
import { navigateToProduct } from "../../lib/runtime.js";

export function ProductCard({ product, labelProduct, dict = {} }) {
  const name = labelProduct(product);
  const rating = getProductRating(product);
  const outOfStock = isOutOfStock(product);
  const ratingLabel = formatRatingLabel(dict.ratingLabel, rating);

  return (
    <Badge.Ribbon text={product.sale} color="#d71920">
      <Card
        hoverable
        className={`product-card${outOfStock ? " is-out-of-stock" : ""}`}
        onClick={() => navigateToProduct(product)}
        cover={
          <div className="product-card-media">
            <Image preview={false} src={product.image} alt={name} />
            {outOfStock ? <span className="product-card-stock">{dict.outOfStock}</span> : null}
          </div>
        }
      >
        <Title level={5}>{name}</Title>
        {product.material ? <Text className="product-card-material">{product.material}</Text> : null}
        <div className="product-card-rating" role="img" aria-label={ratingLabel || undefined}>
          <Rate disabled allowHalf value={rating} />
        </div>
        <Space wrap>
          <Text className="price">{product.price}</Text>
          <Text delete type="secondary">{product.oldPrice}</Text>
        </Space>
      </Card>
    </Badge.Ribbon>
  );
}
