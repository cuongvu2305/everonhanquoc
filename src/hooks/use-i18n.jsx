const EMPTY_DICT = {
  topPages: {},
  categoryMap: {},
  productMap: {},
  tileMap: {},
  policyMap: {},
  newsPosts: [],
  aboutCards: [],
  categoryDesc: "",
  productCount: "{count}",
};

function template(value, params = {}) {
  return String(value ?? "").replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}

export function useI18n(lang, localeDict) {
  const rawDict = localeDict ?? EMPTY_DICT;
  const dict = {
    ...EMPTY_DICT,
    ...rawDict,
    topPages: rawDict.topPages ?? EMPTY_DICT.topPages,
    categoryMap: rawDict.categoryMap ?? EMPTY_DICT.categoryMap,
    productMap: rawDict.productMap ?? EMPTY_DICT.productMap,
    tileMap: rawDict.tileMap ?? EMPTY_DICT.tileMap,
    policyMap: rawDict.policyMap ?? EMPTY_DICT.policyMap,
    newsPosts: rawDict.newsPosts ?? EMPTY_DICT.newsPosts,
    aboutCards: rawDict.aboutCards ?? EMPTY_DICT.aboutCards,
    categoryDesc: (category) => template(rawDict.categoryDesc, { category }),
    productCount: (count) => template(rawDict.productCount, { count }),
  };
  const labelCategory = (category) => dict.categoryMap[category] ?? category;
  const labelProduct = (product) => dict.productMap[product.name] ?? product.name;
  const labelTile = (tile) => dict.tileMap[tile.name] ?? tile.name;
  const labelPolicy = (policy) => dict.policyMap[policy] ?? policy;
  return { dict, labelCategory, labelProduct, labelTile, labelPolicy };
}
