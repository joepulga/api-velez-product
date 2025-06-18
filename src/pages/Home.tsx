import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/productsService';
import type { Product } from '../types/Product';
import ProductCard from '../components/ProductCard';
import CartButton from '../components/CartButton';
import CartSlider from '../components/CartSlider';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Error al cargar los productos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home">
      <header className="header">
        <h1>Vélez - Productos</h1>
        <CartButton onClick={() => setIsCartOpen(true)} />
      </header>
      
      <main className="products-grid">
        {products.slice(0, 12).map((product) => (
          <Link key={product.productId} to={`/producto/${product.productId}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </main>

      <CartSlider isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Home; 