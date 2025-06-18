import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product, ProductItem } from '../types/Product';
import type { CartItem } from '../types/Cart';
import { getCartFromStorage, saveCartToStorage, clearCartFromStorage } from '../utils/localStorage';

// Definir qué propiedades va a tener nuestro contexto del carrito
interface CartContextProps {
  cart: CartItem[];
  addToCart: (product: Product, item: ProductItem, color?: string, size?: string) => void;
  removeFromCart: (productId: string, itemId: string, color?: string, size?: string) => void;
  clearCart: () => void;
  total: number;
}

// Crear el contexto con el tipo que definimos
const CartContext = createContext<CartContextProps | undefined>(undefined);

// Componente que va a envolver toda la app y proporcionar el contexto del carrito
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Estado para guardar los productos del carrito
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Estado para saber si ya se inicializó (evita guardar carrito vacío)
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar el carrito desde localStorage cuando se inicia la app
  useEffect(() => {
    const carritoGuardado = getCartFromStorage();
    console.log('Cargando carrito desde localStorage:', carritoGuardado);
    
    if (carritoGuardado && carritoGuardado.length > 0) {
      setCart(carritoGuardado);
    }
    
    setIsInitialized(true);
  }, []);

  // Guardar el carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (isInitialized) {
      console.log('Guardando carrito en localStorage:', cart);
      saveCartToStorage(cart);
    }
  }, [cart, isInitialized]);

  // Función para agregar un producto al carrito
  const addToCart = (product: Product, item: ProductItem, color?: string, size?: string) => {
    setCart(carritoAnterior => {
      // Buscar si el producto ya existe en el carrito
      const productoExistente = carritoAnterior.find(
        itemCarrito => 
          itemCarrito.product.productId === product.productId && 
          itemCarrito.item.itemId === item.itemId && 
          itemCarrito.color === color && 
          itemCarrito.size === size
      );

      // Si ya existe, aumentar la cantidad
      if (productoExistente) {
        return carritoAnterior.map(itemCarrito =>
          itemCarrito === productoExistente 
            ? { ...itemCarrito, quantity: itemCarrito.quantity + 1 } 
            : itemCarrito
        );
      }

      // Si no existe, agregarlo nuevo
      return [...carritoAnterior, { product, item, color, size, quantity: 1 }];
    });
  };

  // Función para quitar un producto del carrito
  const removeFromCart = (productId: string, itemId: string, color?: string, size?: string) => {
    setCart(carritoAnterior => 
      carritoAnterior.filter(itemCarrito => 
        !(itemCarrito.product.productId === productId && 
          itemCarrito.item.itemId === itemId && 
          itemCarrito.color === color && 
          itemCarrito.size === size)
      )
    );
  };

  // Función para vaciar todo el carrito
  const clearCart = () => {
    setCart([]);
    clearCartFromStorage();
  };

  // Calcular el total del carrito sumando precio * cantidad de cada producto
  const total = cart.reduce((sumaTotal, producto) => {
    const { Price } = producto.item.sellers[0]?.commertialOffer ?? {};
    const precioProducto = Price || 0;
    return sumaTotal + (precioProducto * producto.quantity);
  }, 0);

  // Proporcionar el contexto a todos los componentes hijos
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto del carrito
export const useCartContext = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCartContext debe usarse dentro de un CartProvider');
  }
  
  return context;
}; 