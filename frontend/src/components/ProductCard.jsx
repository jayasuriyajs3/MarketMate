import { useState } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'shopkeeper') {
      alert('Shopkeepers cannot add products to cart');
      return;
    }

    setAdding(true);
    const success = await addToCart(product._id, 1);
    setAdding(false);
    if (success) {
      alert('Added to cart!');
    } else {
      alert('Error adding to cart');
    }
  };

  return (
    <div className="mm-surface mm-border rounded-xl overflow-hidden hover:mm-shadow transition transform hover:-translate-y-1 flex flex-col">
      <img
        src={product.imageUrl}
        alt={product.productName}
        className="mm-img"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Image+Unavailable';
        }}
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg mb-1">{product.productName}</h3>
        <p className="text-sm mm-text-muted mb-2">{product.category}</p>

        {/* Shop Info */}
        <div className="mb-3 pb-3" style={{borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
          <p className="text-sm font-semibold" style={{color: 'var(--accent)'}}>
            {product.shopkeeper?.shopName || product.shopName}
          </p>
          {product.shopkeeper?.address && (
            <p className="text-xs mm-text-muted">{product.shopkeeper.address}</p>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          {product.discount > 0 ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold mm-price">₹{product.finalPrice}</span>
                <span className="text-sm mm-strike">₹{product.price}</span>
              </div>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded" style={{background:'rgba(34,197,94,0.15)', color:'#86efac'}}>
                {product.discount}% OFF
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold">₹{product.price}</span>
          )}
          <p className="text-xs mm-text-muted mt-1">per {product.unit}</p>
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm font-semibold`} style={{color: product.stock > 0 ? '#86efac' : '#fca5a5'}}>
            {product.stock > 0 ? `In Stock: ${product.stock} ${product.unit}` : 'Out of Stock'}
          </p>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm mm-text-muted mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className="w-full mm-btn mm-btn-primary py-2 text-sm font-semibold disabled:opacity-50"
          style={{ marginTop: 'auto' }}
        >
          {adding ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
