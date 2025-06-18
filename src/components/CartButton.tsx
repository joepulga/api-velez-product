
import { useCartContext } from '../context/CartContext';

interface CartButtonProps {
  onClick: () => void;
}

const CartButton = ({ onClick }: CartButtonProps) => {
  // Obtener datos del carrito
  const { cart } = useCartContext();
  
  // Calcular el total de productos en el carrito
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Verificar si hay productos en el carrito
  const hasItems = getTotalItems() > 0;

  return (
    <button className="cart-button" onClick={onClick}>
      {/* Icono del carrito */}
      <span className="cart-icon">🛒</span>
      
      {/* Texto del botón */}
      <span className="cart-text">Carrito</span>
      
      {/* Badge con cantidad de productos */}
      {hasItems && (
        <span className="cart-badge">{getTotalItems()}</span>
      )}
    </button>
  );
};

export default CartButton; 