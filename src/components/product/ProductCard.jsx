import { Badge, Card, Image, Rate, Space, Text, Title } from "../../app/globals.jsx";
import { navigateToProduct } from "../../lib/runtime.js";

const DEFAULT_RATING = 5;

function getRating(product) {
  if (product.rating === null || product.rating === undefined || product.rating === "") return DEFAULT_RATING;
  const rating = Number(product.rating);
  return Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : DEFAULT_RATING;
}

export function ProductCard({ product, labelProduct, dict = {} }) {
  const name = labelProduct(product);
  const rating = getRating(product);
  const outOfStock = product.outOfStock === true;
  const ratingLabel = String(dict.ratingLabel ?? "").replace("{rating}", rating);

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
