import { Alert, Button, Card, Col, Descriptions, Empty, Flex, Image, Paragraph, Rate, Row, Space, Tag, Text, Title } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";
import { PageBreadcrumb } from "../layout/PageBreadcrumb.jsx";
import { ProductGrid } from "../product/ProductGrid.jsx";
import { formatRatingLabel, getDiscountLabel, getDisplayProductCode, getProductRating, isOutOfStock, shouldShowOldPrice } from "../../lib/product.js";
import { navigateToCategory, navigateToTopPage } from "../../lib/runtime.js";

// Only rows backed by real product data are shown; nothing is filled in with guesses.
function buildSpecItems(product, { dict, labelCategory, outOfStock }) {
  const code = getDisplayProductCode(product);
  return [
    code ? { key: "code", label: dict.productCode, children: <Text strong>{code}</Text> } : null,
    {
      key: "category",
      label: dict.productCategory,
      children: (
        <Button type="link" className="product-spec-link" onClick={() => navigateToCategory(product.category)}>
          {labelCategory(product.category)}
        </Button>
      ),
    },
    product.collection ? { key: "collection", label: dict.productCollection, children: product.collection } : null,
    product.material ? { key: "material", label: dict.productMaterial, children: <Text className="product-detail-material">{product.material}</Text> } : null,
    {
      key: "status",
      label: dict.productStatus,
      children: <Text strong className={`product-detail-status ${outOfStock ? "is-out" : "is-in"}`}>{outOfStock ? dict.outOfStock : dict.inStock}</Text>,
    },
  ].filter(Boolean);
}

export function ProductDetailPage({ product, relatedProducts, langTools, onAddToCart, onBuyNow }) {
  const { dict, labelCategory, labelProduct } = langTools;

  if (!product) {
    return (
      <Card className="section-panel page-panel">
        <Empty description={dict.productNotFound} />
      </Card>
    );
  }

  const name = labelProduct(product);
  const rating = getProductRating(product);
  const outOfStock = isOutOfStock(product);
  const specItems = buildSpecItems(product, { dict, labelCategory, outOfStock });

  return (
    <Card className={`section-panel page-panel product-detail-page${outOfStock ? " is-out-of-stock" : ""}`}>
      <PageBreadcrumb
        dict={dict}
        items={[
          { label: labelCategory(product.category), onClick: () => navigateToCategory(product.category) },
          { label: name },
        ]}
      />
      <Row gutter={[24, 24]} align="top">
        <Col xs={24} lg={11}>
          <div className="product-detail-media">
            <Image className="product-detail-image" preview={false} src={product.image} alt={name} />
            {outOfStock ? <span className="product-detail-stock-badge">{dict.outOfStock}</span> : null}
          </div>
        </Col>
        <Col xs={24} lg={13}>
          <Flex vertical gap={14}>
            <Space wrap>
              <Tag color="#16842c">{labelCategory(product.category)}</Tag>
              {getDiscountLabel(product) ? <Tag color="#d71920">{getDiscountLabel(product)}</Tag> : null}
            </Space>
            <Title level={2}>{name}</Title>
            <div className="product-detail-rating" role="img" aria-label={formatRatingLabel(dict.ratingLabel, rating) || undefined}>
              <Rate disabled allowHalf value={rating} />
            </div>
            <Space align="baseline" wrap>
              <Text className="product-detail-price">{product.price}</Text>
              {shouldShowOldPrice(product) ? <Text delete type="secondary">{product.oldPrice}</Text> : null}
            </Space>
            {outOfStock && dict.outOfStockNotice ? <Alert className="product-detail-stock-alert" type="warning" showIcon message={dict.outOfStockNotice} /> : null}
            <div className="product-detail-actions">
              <Button className="product-buy-now" type="primary" danger size="large" icon={<Icon name="Zap" />} disabled={outOfStock} onClick={() => onBuyNow?.(product)}>
                {dict.buyNow}
              </Button>
              <Button className="product-add-to-cart" type="primary" ghost size="large" icon={<Icon name="ShoppingCart" />} disabled={outOfStock} onClick={() => onAddToCart(product)}>
                {dict.addToCart}
              </Button>
              <Button className="product-contact" type={outOfStock ? "primary" : "default"} size="large" onClick={() => navigateToTopPage("contact")} icon={<Icon name="PhoneCall" />}>
                {dict.contactConsulting}
              </Button>
            </div>
            <Paragraph className="product-detail-desc">{dict.productDetailDesc}</Paragraph>
            <section className="product-specs" aria-labelledby="product-specs-title">
              <Title level={4} id="product-specs-title" className="product-specs-title">{dict.productSpecs}</Title>
              <Descriptions className="product-specs-table" bordered size="small" column={1} items={specItems} />
            </section>
          </Flex>
        </Col>
      </Row>

      {relatedProducts.length > 0 ? (
        <section className="related-products">
          <Title level={3}>{dict.relatedProducts}</Title>
          <ProductGrid products={relatedProducts} labelProduct={labelProduct} dict={dict} emptyText={dict.emptyCategory} />
        </section>
      ) : null}
    </Card>
  );
}
