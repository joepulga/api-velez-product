
import type { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  // Obtener la imagen principal del producto
  const getMainImage = () => {
    return product.items[0]?.images[0]?.imageUrl;
  };

  // Extraer los precios del producto
  const getProductPrices = () => {
    const offer = product.items[0]?.sellers[0]?.commertialOffer;
    
    return {
      price: offer?.Price,
      priceWithoutDiscount: offer?.PriceWithoutDiscount
    };
  };

  // Formatear precio para mostrar
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  // Verificar si hay descuento
  const hasDiscount = (priceWithoutDiscount: number | undefined, price: number | undefined) => {
    return (priceWithoutDiscount ?? 0) > (price ?? 0);
  };

  // Obtener datos del producto
  const mainImage = getMainImage();
  const { price, priceWithoutDiscount } = getProductPrices();

  return (
    <div className="product-card" onClick={onClick}>
      {/* Imagen del producto */}
      <div className="product-image">
        <img 
          src={mainImage} 
          alt={product.productName}
          onError={(e) => {
            // Si la imagen falla, mostrar una imagen por defecto
            e.currentTarget.src = '/placeholder-image.jpg';
          }}
        />
      </div>

      {/* Información del producto */}
      <div className="product-info">
        <h3 className="product-name">
          {product.productName}
        </h3>
        
        <p className="product-brand">
          {product.brand}
        </p>

        {/* Precios */}
        <div className="product-prices">
          {price ? (
            <>
              {/* Mostrar precio original tachado si hay descuento */}
              {hasDiscount(priceWithoutDiscount, price) && (
                <p className="product-price-original">
                  ${formatPrice(priceWithoutDiscount!)}
                </p>
              )}
              
              {/* Precio actual */}
              <p className="product-price">
                ${formatPrice(price)}
              </p>
            </>
          ) : (
            <p className="product-price">
              Precio no disponible
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 