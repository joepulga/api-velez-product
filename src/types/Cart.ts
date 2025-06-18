import type { Product, ProductItem } from './Product';

export interface CartItem {
  product: Product;
  item: ProductItem;
  color?: string;
  size?: string;
  quantity: number;
} 