import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import Header from './Header';

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, loading } = useCart();

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="mm-surface mm-border rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Please log in</h1>
            <p className="mm-text-muted mb-4">You need to be logged in to view your cart.</p>
            <button
              onClick={() => navigate('/login')}
              className="mm-btn mm-btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

          {cart.items && cart.items.length === 0 ? (
            <div className="mm-surface mm-border rounded-lg p-8 text-center">
              <p className="mm-text-muted text-lg mb-4">Your cart is empty</p>
              <button
                onClick={() => navigate('/')}
                className="mm-btn mm-btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="mm-surface mm-border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.productName}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-bold">{item.product.productName}</h3>
                        <p className="text-sm mm-text-muted">{item.product.category}</p>
                        <p className="text-xs mm-text-muted mt-1">{item.product.shopName}</p>
                      </div>
                      <div>
                        <p className="font-bold mm-price">₹{item.product.finalPrice}</p>
                        {item.product.discount > 0 && (
                          <p className="text-xs mm-strike">₹{item.product.price}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          disabled={item.quantity === 1 || loading}
                          className="mm-btn px-2 py-1 text-sm disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 mm-muted-surface rounded text-center w-10">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={loading}
                          className="mm-btn px-2 py-1 text-sm disabled:opacity-50"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          disabled={loading}
                          className="mm-btn mm-btn-danger px-2 py-1 text-sm disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <p className="font-bold">
                        Subtotal: <span className="mm-price">₹{(item.product.finalPrice * item.quantity).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mm-surface mm-border rounded-lg p-6 h-fit sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between mm-text-muted">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mm-text-muted">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div style={{borderTop: '1px solid rgba(255,255,255,0.08)'}} className="pt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="mm-price">₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mm-btn mm-btn-primary py-3 font-bold"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full mm-btn mt-3 py-3 font-bold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
