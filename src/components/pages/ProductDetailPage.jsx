import { Alert, Button, Card, Col, Descriptions, Empty, Flex, Paragraph, Rate, Row, Skeleton, Space, Tag, Text, Title, useState } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";
import { PageBreadcrumb } from "../layout/PageBreadcrumb.jsx";
import { ProductGallery } from "../product/ProductGallery.jsx";
import { ProductGrid } from "../product/ProductGrid.jsx";
import { VariantPicker } from "../product/VariantPicker.jsx";
import { useProductDetails } from "../../hooks/use-storefront.jsx";
import { formatRatingLabel, getDiscountLabel, getDisplayProductCode, getProductRating, isOutOfStock, parsePrice, shouldShowOldPrice } from "../../lib/product.js";
import { navigateToCategory, navigateToTopPage } from "../../lib/runtime.js";
import { pickDefaultVariant } from "../../lib/variants.js";

// "-15%" from a variant's own prices, so the badge follows the selected size.
function variantDiscount(variant) {
  const price = parsePrice(variant?.price);
  const oldPrice = parsePrice(variant?.oldPrice);
  if (!price || !oldPrice || oldPrice <= price) return null;
  const percent = Math.round((1 - price / oldPrice) * 100);
  return percent > 0 ? `-${percent}%` : null;
}

// Only rows backed by real product data are shown; nothing is filled in with guesses.
// `specs` are the source site's rows (Thương hiệu, Loại, Chất liệu, Bảo hành, Màu sắc...).
function buildSpecItems(product, { dict, labelCategory, outOfStock, specs = [] }) {
  const code = getDisplayProductCode(product);
  const sourceLabels = new Set(specs.map(([label]) => label));
  const showMaterial = product.material && !sourceLabels.has("Chất liệu");
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
    showMaterial ? { key: "material", label: dict.productMaterial, children: <Text className="product-detail-material">{product.material}</Text> } : null,
    ...specs.map(([label, value], index) => ({ key: `spec-${index}`, label, children: value })),
    {
      key: "status",
      label: dict.productStatus,
      children: <Text strong className={`product-detail-status ${outOfStock ? "is-out" : "is-in"}`}>{outOfStock ? dict.outOfStock : dict.inStock}</Text>,
    },
  ].filter(Boolean);
}

export function ProductDetailPage({ product, relatedProducts, langTools, onAddToCart, onBuyNow }) {
  const { dict, labelCategory, labelProduct } = langTools;
  const { details, loading: detailsLoading } = useProductDetails(product?.detailId);
  const [chosen, setChosen] = useState({ detailId: null, variantId: null });

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
  const variants = details?.variants ?? [];
  const selected =
    (chosen.detailId === product.detailId && variants.find((variant) => variant.id === chosen.variantId)) ||
    pickDefaultVariant(variants, product);
  const priced = selected ?? product;
  const discount = selected ? variantDiscount(selected) : getDiscountLabel(product);
  const images = details?.images?.length ? details.images : [product.image];
  const specItems = buildSpecItems(product, { dict, labelCategory, outOfStock, specs: details?.specs });
  const stockBadge = outOfStock ? <span className="product-detail-stock-badge">{dict.outOfStock}</span> : null;

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
          <ProductGallery images={images} alt={name} dict={dict} overlay={stockBadge} />
        </Col>
        <Col xs={24} lg={13}>
          <Flex vertical gap={14}>
            <Space wrap>
              <Tag color="#16842c">{labelCategory(product.category)}</Tag>
              {discount ? <Tag color="#d71920">{discount}</Tag> : null}
            </Space>
            <Title level={2}>{name}</Title>
            <div className="product-detail-rating" role="img" aria-label={formatRatingLabel(dict.ratingLabel, rating) || undefined}>
              <Rate disabled allowHalf value={rating} />
            </div>
            <Space align="baseline" wrap>
              <Text className="product-detail-price">{priced.price}</Text>
              {shouldShowOldPrice(priced) ? <Text delete type="secondary">{priced.oldPrice}</Text> : null}
            </Space>
            {detailsLoading ? <Skeleton.Input active block className="variant-picker-skeleton" /> : null}
            {selected ? (
              <VariantPicker
                variants={variants}
                value={selected}
                onChange={(variant) => setChosen({ detailId: product.detailId, variantId: variant.id })}
                dict={dict}
                disabled={outOfStock}
              />
            ) : null}
            {outOfStock && dict.outOfStockNotice ? <Alert className="product-detail-stock-alert" type="warning" showIcon message={dict.outOfStockNotice} /> : null}
            <div className="product-detail-actions">
              <Button className="product-buy-now" type="primary" danger size="large" icon={<Icon name="Zap" />} disabled={outOfStock} onClick={() => onBuyNow?.(product, selected)}>
                {dict.buyNow}
              </Button>
              <Button className="product-add-to-cart" type="primary" ghost size="large" icon={<Icon name="ShoppingCart" />} disabled={outOfStock} onClick={() => onAddToCart(product, selected)}>
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
