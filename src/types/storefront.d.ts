export interface StorefrontProduct {
  name: string;
  category: string;
  sale: string;
  price: string;
  oldPrice: string;
  image: string;
}

export interface StorefrontTile {
  name: string;
  image: string;
}

export interface StorefrontData {
  categories: string[];
  tiles: StorefrontTile[];
  products: StorefrontProduct[];
  policies: string[];
}
