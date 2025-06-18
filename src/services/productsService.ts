import type { Product } from '../types/Product';

const API_URL = 'https://api-prueba-frontend.onrender.com/api/products';

export async function fetchProducts() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Error al obtener los productos');
  }
  return response.json();
}

export async function fetchProductById(productId: string) {
  console.log('Buscando producto con ID:', productId);
  
  const products = await fetchProducts();
  console.log('Productos obtenidos:', products.length);
  
  const product = products.find((product: Product) => product.productId === productId);
  console.log('Producto encontrado:', product ? 'Sí' : 'No');
  
  if (product) {
    console.log('Detalles del producto:', {
      id: product.productId,
      name: product.productName,
      items: product.items?.length || 0
    });
  }
  
  return product;
} 