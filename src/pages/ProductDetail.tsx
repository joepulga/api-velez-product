import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, fetchProducts } from '../services/productsService';
import type { Product } from '../types/Product';
import { useCartContext } from '../context/CartContext';
import CartButton from '../components/CartButton';
import CartSlider from '../components/CartSlider';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { productId } = useParams();
  
  // Estados
  const [product, setProduct] = useState<Product>();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selections, setSelections] = useState({
    imageIndex: 0,
    color: '',
    size: '',
    selectedItemId: ''
  });
  
  const { addToCart } = useCartContext();

  // Calcular variantes disponibles
  const productVariants = useMemo(() => {
    if (!product?.items) return { colors: [], sizesByColor: {}, itemIdByVariant: {} };

    const colors: string[] = [];
    const sizesByColor: Record<string, string[]> = {};
    const itemIdByVariant: Record<string, string> = {};

    product.items.forEach(item => {
      const itemColors = item.Color || [];
      const itemSizes = item.Talla || [];

      // Agregar colores únicos
      itemColors.forEach(color => {
        if (!colors.includes(color)) {
          colors.push(color);
        }
      });

      // Agregar tallas por color
      itemColors.forEach(color => {
        if (!sizesByColor[color]) {
          sizesByColor[color] = [];
        }
        
        itemSizes.forEach(size => {
          if (!sizesByColor[color].includes(size)) {
            sizesByColor[color].push(size);
          }
        });
      });

      // Mapear variantes a itemId
      itemColors.forEach(color => {
        itemSizes.forEach(size => {
          const variantKey = `${color}-${size}`;
          itemIdByVariant[variantKey] = item.itemId;
        });
      });
    });

    return { colors, sizesByColor, itemIdByVariant };
  }, [product]);

  // Obtener item seleccionado
  const selectedItem = useMemo(() => {
    if (!product?.items || !selections.selectedItemId) {
      console.log('No hay item seleccionado:', { 
        hasProduct: !!product, 
        hasItems: !!product?.items, 
        selectedItemId: selections.selectedItemId 
      });
      return;
    }
    
    const item = product.items.find(item => item.itemId === selections.selectedItemId);
    console.log('Item seleccionado encontrado:', item);
    return item;
  }, [product, selections.selectedItemId]);

  // Obtener tallas disponibles
  const availableSizes = useMemo(() => {
    if (!selections.color) return [];
    return productVariants.sizesByColor[selections.color] || [];
  }, [selections.color, productVariants.sizesByColor]);

  // Cambiar color
  const handleColorChange = (newColor: string) => {
    const sizesForColor = productVariants.sizesByColor[newColor] || [];
    const defaultSize = sizesForColor[0] || '';
    const variantKey = `${newColor}-${defaultSize}`;
    const newItemId = productVariants.itemIdByVariant[variantKey] || '';

    setSelections(prev => ({
      ...prev,
      color: newColor,
      size: defaultSize,
      selectedItemId: newItemId,
      imageIndex: 0
    }));
  };

  // Cambiar talla
  const handleSizeChange = (newSize: string) => {
    const variantKey = `${selections.color}-${newSize}`;
    const newItemId = productVariants.itemIdByVariant[variantKey] || '';

    setSelections(prev => ({
      ...prev,
      size: newSize,
      selectedItemId: newItemId,
      imageIndex: 0
    }));
  };

  // Cargar producto
  useEffect(() => {
    if (!productId) return;
    
    console.log('Cargando producto con ID:', productId);
    setLoading(true);
    setError(null);
    
    // Reiniciar selecciones cuando se carga un nuevo producto
    setSelections({
      imageIndex: 0,
      color: '',
      size: '',
      selectedItemId: ''
    });
    
    Promise.all([
      fetchProductById(productId),
      fetchProducts()
    ])
      .then(([productData, allProducts]) => {
        console.log('Producto cargado:', productData);
        console.log('Todos los productos:', allProducts.length);
        
        if (!productData) {
          console.log('No se encontró el producto');
          setError('Producto no encontrado');
          setLoading(false);
          return;
        }
        
        console.log('Producto encontrado, configurando estado');
        setProduct(productData);
        
        // Seleccionar primera variante inmediatamente
        if (productData.items && productData.items.length > 0) {
          const firstItem = productData.items[0];
          const itemColors = firstItem.Color || [];
          const itemSizes = firstItem.Talla || [];
          
          if (itemColors.length > 0 && itemSizes.length > 0) {
            const firstColor = itemColors[0];
            const firstSize = itemSizes[0];
            
            console.log('Seleccionando primera variante:', { firstColor, firstSize, itemId: firstItem.itemId });
            
            setSelections({
              imageIndex: 0,
              color: firstColor,
              size: firstSize,
              selectedItemId: firstItem.itemId
            });
          }
        }
        
        // Productos relacionados
        const related = allProducts
          .filter((p: Product) => p.productId !== productId)
          .slice(0, 4);
        setRelatedProducts(related);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar producto:', error);
        setError('No se pudo cargar el producto');
        setLoading(false);
      });
  }, [productId]);

  // Seleccionar primera variante disponible (fallback)
  useEffect(() => {
    if (productVariants.colors.length > 0 && !selections.color && product?.items) {
      console.log('Fallback: Seleccionando primera variante');
      
      const firstColor = productVariants.colors[0];
      const firstSize = productVariants.sizesByColor[firstColor]?.[0] || '';
      const variantKey = `${firstColor}-${firstSize}`;
      const firstItemId = productVariants.itemIdByVariant[variantKey] || '';

      setSelections(prev => ({
        ...prev,
        color: firstColor,
        size: firstSize,
        selectedItemId: firstItemId
      }));
    }
  }, [productVariants, selections.color, product]);

  // Calcular precios
  const prices = useMemo(() => {
    if (!selectedItem?.sellers?.[0]?.commertialOffer) {
      return { price: 0, priceWithoutDiscount: 0 };
    }
    
    const offer = selectedItem.sellers[0].commertialOffer;
    return {
      price: offer.Price || 0,
      priceWithoutDiscount: offer.PriceWithoutDiscount || 0
    };
  }, [selectedItem]);

  // Agregar al carrito
  const handleAddToCart = () => {
    if (!product || !selectedItem) return;
    
    addToCart(product, selectedItem, selections.color, selections.size);
    setIsCartOpen(true);
  };

  if (loading) return <div className="loading">Cargando producto...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Producto no encontrado</div>;

  const images = selectedItem?.images || [];
  const { price, priceWithoutDiscount } = prices;

  console.log('Renderizando producto:', {
    productName: product.productName,
    selectedItem: !!selectedItem,
    imagesCount: images.length,
    price,
    selections
  });

  return (
    <div className="product-detail-page">
      <header className="header">
        <Link to="/" className="back-link">← Volver a productos</Link>
        <CartButton onClick={() => setIsCartOpen(true)} />
      </header>

      <main className="product-detail-container">
        {/* Galería de imágenes */}
        <div className="product-images">
          <div className="main-image">
            <img 
              src={images[selections.imageIndex]?.imageUrl} 
              alt={product.productName} 
            />
          </div>
          <div className="image-thumbnails">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.imageUrl}
                alt={`${product.productName} ${index + 1}`}
                className={selections.imageIndex === index ? 'active' : ''}
                onClick={() => setSelections(prev => ({ ...prev, imageIndex: index }))}
              />
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="product-info">
          <h1 className="product-title">{product.productName}</h1>
          <p className="product-brand">{product.brand}</p>
          <p className="product-reference">Referencia: {product.productReference}</p>
          
          {/* Precios */}
          <div className="product-price">
            {price > 0 ? (
              <div className="price-container">
                {priceWithoutDiscount > price && (
                  <span className="price-original">${priceWithoutDiscount.toLocaleString()}</span>
                )}
                <span className="price-current">${price.toLocaleString()}</span>
              </div>
            ) : (
              <span className="price">Precio no disponible</span>
            )}
          </div>

          {/* Selector de color */}
          {productVariants.colors.length > 0 && (
            <div className="product-option">
              <label>Color:</label>
              <div className="option-buttons">
                {productVariants.colors.map((color) => (
                  <button
                    key={color}
                    className={selections.color === color ? 'active' : ''}
                    onClick={() => handleColorChange(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de talla */}
          {availableSizes.length > 0 && (
            <div className="product-option">
              <label>Talla:</label>
              <div className="option-buttons">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={selections.size === size ? 'active' : ''}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Información de la variante */}
          {selections.selectedItemId && (
            <div className="selected-variant-info">
              <p className="variant-details">
                <strong>Variante seleccionada:</strong> {selections.color} - {selections.size}
              </p>
              <p className="item-id">ID: {selections.selectedItemId}</p>
            </div>
          )}

          {/* Botón de agregar al carrito */}
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={price === 0 || !selectedItem}
          >
            {price > 0 && selectedItem ? 'Agregar al Carrito' : 'Producto no disponible'}
          </button>

          {/* Descripción */}
          {product.description && (
            <div className="product-description">
              <h3>Descripción</h3>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </main>

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <section className="related-products">
          <h2>Productos Relacionados</h2>
          <div className="products-grid">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.productId} to={`/producto/${relatedProduct.productId}`}>
                <ProductCard product={relatedProduct} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Carrito */}
      <CartSlider isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default ProductDetail; 