import { useCartContext } from '../context/CartContext';
import type { CartItem } from '../types/Cart';

const CartSummary = () => {
  const { cart, total, removeFromCart, clearCart } = useCartContext();

  // Si no hay productos en el carrito, mostrar mensaje
  if (cart.length === 0) {
    return (
      <div className="cart-summary">
        <h4>Carrito</h4>
        <p>No tienes productos en el carrito</p>
      </div>
    );
  }

  // Función para obtener el precio de un item (unificada con ProductCard)
  const getItemPrice = (item: CartItem) => {
    const { Price } = item.item.sellers[0]?.commertialOffer ?? {};
    return Price ? Price.toLocaleString() : '0';
  };

  return (
    <div className="cart-summary">
      <h4>Carrito</h4>
      
      <ul className="cart-items-list">
        {cart.map((item, index) => {
          const { productId, productName } = item.product;
          const { itemId, images } = item.item;
          const { quantity } = item;
          
          return (
            <li key={`${productId}-${itemId}-${index}`} className="cart-item">
              <img 
                src={images[0]?.imageUrl} 
                alt={productName} 
                width={40} 
                height={40}
                onError={(e) => {
                  // Si la imagen falla, mostrar una imagen por defecto
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
              <div className="item-details">
                <span className="item-name">{productName}</span>
                <span className="item-quantity">Cantidad: {quantity}</span>
                <span className="item-price">${getItemPrice(item)}</span>
              </div>
              <button 
                onClick={() => removeFromCart(productId, itemId)}
                className="remove-btn"
              >
                Eliminar
              </button>
            </li>
          );
        })}
      </ul>

      <div className="cart-total">
        <strong>Total: ${total.toLocaleString()}</strong>
      </div>

      <div className="cart-actions">
        <button onClick={clearCart} className="clear-btn">
          Vaciar carrito
        </button>
        <button disabled className="checkout-btn">
          Finalizar compra
        </button>
      </div>
    </div>
  );
};

export default CartSummary; 