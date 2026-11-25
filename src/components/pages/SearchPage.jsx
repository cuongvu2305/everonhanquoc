import { Button, Card, Space, Tag } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";
import { PageHeader } from "../layout/PageHeader.jsx";
import { ProductGrid } from "../product/ProductGrid.jsx";
import { searchProducts } from "../../lib/search.js";

export function SearchPage({ products, query, langTools }) {
  const { dict, labelProduct } = langTools;
  const results = searchProducts(products, query, labelProduct);

  return (
    <Card className="section-panel page-panel search-page">
      <PageHeader
        icon="Search"
        title={dict.searchResultsTitle}
        description={dict.searchResultsDesc.replace("{query}", query || "...")}
        extra={
          <Space wrap size={[8, 8]}>
            <Tag color="#16842c">{dict.productCount(results.length)}</Tag>
            <Button size="small" href="/" icon={<Icon name="Home" />}>
              {dict.topPages.home}
            </Button>
          </Space>
        }
      />
      <ProductGrid products={results} labelProduct={labelProduct} dict={dict} emptyText={dict.emptySearchResults} paginated />
    </Card>
  );
}
