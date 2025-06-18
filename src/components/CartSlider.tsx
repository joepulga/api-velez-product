import { useCartContext } from '../context/CartContext';
import type { CartItem } from '../types/Cart';

interface CartSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlider = ({ isOpen, onClose }: CartSliderProps) => {
  // Obtener datos del carrito
  const { cart, total, removeFromCart, clearCart } = useCartContext();

  // Obtener el precio de un producto del carrito
  const getItemPrice = (item: CartItem) => {
    const { Price } = item.item.sellers[0]?.commertialOffer ?? {};
    return Price || 0;
  };

  // Si el carrito está vacío, mostrar mensaje
  const renderEmptyCart = () => (
    <div className="empty-cart">
      <p>Tu carrito está vacío</p>
      <span>🛒</span>
    </div>
  );

  // Renderizar cada producto del carrito
  const renderCartItem = (item: CartItem, index: number) => {
    const { productId, productName, brand } = item.product;
    const { itemId, images } = item.item;
    const { quantity, color, size } = item;

    return (
      <div key={`${productId}-${itemId}-${color}-${size}-${index}`} className="cart-item">
        {/* Imagen del producto */}
        <img 
          src={images[0]?.imageUrl} 
          alt={productName} 
          className="item-image"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-image.jpg';
          }}
        />

        {/* Detalles del producto */}
        <div className="item-details">
          <h4 className="item-name">{productName}</h4>
          <p className="item-brand">{brand}</p>
          
          {/* Mostrar color si existe */}
          {color && <p className="item-variant">Color: {color}</p>}
          
          {/* Mostrar talla si existe */}
          {size && <p className="item-variant">Talla: {size}</p>}
          
          <p className="item-quantity">Cantidad: {quantity}</p>
          <p className="item-price">
            ${getItemPrice(item).toLocaleString()}
          </p>
        </div>

        {/* Botón para eliminar producto */}
        <button 
          className="remove-item-btn"
          onClick={() => removeFromCart(productId, itemId, color, size)}
        >
          ×
        </button>
      </div>
    );
  };

  // Renderizar el footer del carrito con total y botones
  const renderCartFooter = () => (
    <div className="cart-footer">
      <div className="cart-total">
        <span>Total:</span>
        <span className="total-price">${total.toLocaleString()}</span>
      </div>
      
      <div className="cart-actions">
        <button className="clear-cart-btn" onClick={clearCart}>
          Vaciar Carrito
        </button>
        <button className="checkout-btn" disabled>
          Finalizar Compra
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Fondo oscuro cuando el carrito está abierto */}
      {isOpen && (
        <div className="cart-overlay" onClick={onClose}></div>
      )}
      
      {/* Panel deslizable del carrito */}
      <div className={`cart-slider ${isOpen ? 'open' : ''}`}>
        {/* Header del carrito */}
        <div className="cart-header">
          <h3>Carrito de Compras</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* Contenido del carrito */}
        <div className="cart-content">
          {cart.length === 0 ? (
            renderEmptyCart()
          ) : (
            <>
              {/* Lista de productos */}
              <div className="cart-items">
                {cart.map((item, index) => renderCartItem(item, index))}
              </div>
              
              {/* Footer con total y botones */}
              {renderCartFooter()}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSlider; 