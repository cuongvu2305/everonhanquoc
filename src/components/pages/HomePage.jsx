import { Flex } from "../../app/globals.jsx";
import { HomeLatestNews } from "../home/HomeLatestNews.jsx";
import { ShowroomList } from "../layout/ShowroomList.jsx";
import { ProductCarousel } from "../product/ProductCarousel.jsx";
import { getCollections, productsByCollection } from "../../lib/collections.js";
import { navigateToCategory } from "../../lib/runtime.js";

export function HomePage({ store, langTools }) {
  const { dict, labelProduct, labelTile } = langTools;
  const openTileCategory = (tileName) => navigateToCategory(tileName);
  const productsByCategory = (category) => store.products.filter((product) => product.category === category || product.categories?.includes(category));
  const collections = getCollections(store.products);
  return (
    <>
      <ShowroomList showrooms={store.showrooms ?? []} dict={dict} />

      <Flex className="home-product-sections" vertical gap={16}>
        {collections.map((collection) => (
          <ProductCarousel
            key={`collection-${collection}`}
            title={collection}
            products={productsByCollection(store.products, collection)}
            labelProduct={labelProduct}
            dict={dict}
            emptyText={dict.emptyCategory}
          />
        ))}
        {store.tiles.map((tile) => (
          <ProductCarousel
            key={tile.name}
            title={labelTile(tile)}
            products={productsByCategory(tile.name)}
            labelProduct={labelProduct}
            dict={dict}
            emptyText={dict.emptyCategory}
            onTitleClick={() => openTileCategory(tile.name)}
          />
        ))}
      </Flex>

      <HomeLatestNews dict={dict} />
    </>
  );
}
