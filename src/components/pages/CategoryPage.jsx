import { Button, Card, Flex, Select, Space, Tag, Text, Title, useMemo, useState } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";
import { PageBreadcrumb } from "../layout/PageBreadcrumb.jsx";
import { PageHeader } from "../layout/PageHeader.jsx";
import { ProductGrid } from "../product/ProductGrid.jsx";
import { sortProducts } from "../../lib/product.js";
import { navigateToCategory, navigateToTopPage } from "../../lib/runtime.js";

export function CategoryPage({ category, products, siblingCategories, langTools }) {
  const { dict, labelCategory, labelProduct } = langTools;
  const [sort, setSort] = useState("default");
  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);
  const relatedCategories = siblingCategories.filter((item) => item !== category);
  const displayCategory = labelCategory(category);
  const sortOptions = [
    { value: "default", label: dict.sortDefault },
    { value: "priceAsc", label: dict.sortPriceAsc },
    { value: "priceDesc", label: dict.sortPriceDesc },
  ];

  return (
    <Card className="section-panel page-panel category-page">
      <PageBreadcrumb dict={dict} items={[{ label: displayCategory }]} />
      <PageHeader
        icon="Layers3"
        title={displayCategory}
        description={dict.categoryDesc(displayCategory)}
        extra={
          <Space wrap size={[8, 8]}>
            <Tag color="#16842c">{dict.productCount(products.length)}</Tag>
            <Button size="small" onClick={() => navigateToTopPage("retail")} icon={<Icon name="PackageOpen" />}>
              {dict.viewAllProducts}
            </Button>
          </Space>
        }
      />
      {products.length > 1 ? (
        <Flex className="category-toolbar" align="center" justify="flex-end" gap={8} wrap>
          <Text id="category-sort-label" className="category-toolbar-label">
            <Icon name="ArrowUpDown" size={15} />
            {dict.sortLabel}
          </Text>
          <Select
            className="category-sort-select"
            aria-labelledby="category-sort-label"
            value={sort}
            options={sortOptions}
            onChange={setSort}
            popupMatchSelectWidth={false}
          />
        </Flex>
      ) : null}
      <ProductGrid key={category} products={sortedProducts} labelProduct={labelProduct} dict={dict} emptyText={dict.emptyCategory} paginated />
      {relatedCategories.length > 0 ? (
        <Flex className="related-categories" vertical>
          <Title level={4}>{dict.relatedCategories}</Title>
          <Space wrap>{relatedCategories.slice(0, 8).map((item) => <Button key={item} onClick={() => navigateToCategory(item)}>{labelCategory(item)}</Button>)}</Space>
        </Flex>
      ) : null}
    </Card>
  );
}
