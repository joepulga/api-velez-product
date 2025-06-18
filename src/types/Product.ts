export interface Product {
  productId: string;
  productName: string;
  brand: string;
  productReference: string;
  description: string;
  items: ProductItem[];
}

export interface ProductItem {
  itemId: string;
  images: ProductImage[];
  Color?: string[];
  Talla?: string[];
  sellers: Seller[];
}

export interface ProductImage {
  imageUrl: string;
}

export interface Seller {
  commertialOffer: CommertialOffer;
}

export interface CommertialOffer {
  Price?: number;
  PriceWithoutDiscount?: number;
} 