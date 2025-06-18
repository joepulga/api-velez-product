import type { CartItem } from '../types/Cart';

const CART_KEY = 'cart';

export function getCartFromStorage() {
  try {
    const data = localStorage.getItem(CART_KEY);
    console.log('Datos del carrito en localStorage:', data);
    
    if (!data) {
      console.log('No hay carrito guardado');
      return null;
    }
    
    const cart = JSON.parse(data);
    console.log('Carrito cargado:', cart);
    return cart;
  } catch (error) {
    console.error('Error al leer el carrito:', error);
    return null;
  }
}

export function saveCartToStorage(cart: CartItem[]) {
  try {
    console.log('Guardando carrito:', cart);
    
    if (cart.length === 0) {
      localStorage.removeItem(CART_KEY);
      console.log('Carrito vacío, eliminado de localStorage');
    } else {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      console.log('Carrito guardado correctamente');
    }
  } catch (error) {
    console.error('Error al guardar el carrito:', error);
  }
}

export function clearCartFromStorage() {
  try {
    localStorage.removeItem(CART_KEY);
    console.log('Carrito eliminado de localStorage');
  } catch (error) {
    console.error('Error al eliminar el carrito:', error);
  }
} 