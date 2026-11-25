import { Badge, Card, Image, Rate, Space, Text, Title } from "../../app/globals.jsx";
import { formatRatingLabel, getDiscountLabel, getProductRating, isOutOfStock, shouldShowOldPrice } from "../../lib/product.js";
import { navigateToProduct } from "../../lib/runtime.js";

export function ProductCard({ product, labelProduct, dict = {} }) {
  const name = labelProduct(product);
  const rating = getProductRating(product);
  const outOfStock = isOutOfStock(product);
  const ratingLabel = formatRatingLabel(dict.ratingLabel, rating);

  const discount = getDiscountLabel(product);
  const card = (
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
        {shouldShowOldPrice(product) ? <Text delete type="secondary">{product.oldPrice}</Text> : null}
      </Space>
    </Card>
  );

  return discount ? (
    <Badge.Ribbon text={discount} color="#d71920">
      {card}
    </Badge.Ribbon>
  ) : (
    card
  );
}
