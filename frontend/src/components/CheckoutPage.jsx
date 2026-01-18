import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import Header from './Header';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert('Please enter a shipping address');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await clearCart();
        alert('Order placed successfully!');
        navigate('/profile?tab=orders', { replace: true });
      } else {
        const data = await response.json();
        alert(data.message || 'Error placing order');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="mm-surface mm-border rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Please log in</h1>
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

  if (!cart.items || cart.items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="mm-surface mm-border rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Cart is empty</h1>
            <button
              onClick={() => navigate('/')}
              className="mm-btn mm-btn-primary"
            >
              Go Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="mm-surface mm-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete address..."
                  rows={4}
                  className="mm-textarea w-full"
                />
              </div>

              {/* Payment Method */}
              <div className="mm-surface mm-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-3 mm-muted-surface rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-semibold">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center p-3 mm-muted-surface rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-semibold">UPI / Digital Payment</span>
                  </label>
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="mm-surface mm-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.product._id} className="flex justify-between mm-text-muted">
                      <span>
                        {item.product.productName} x {item.quantity}
                      </span>
                      <span className="font-semibold" style={{color: 'var(--accent)'}}>
                        ₹{(item.product.finalPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mm-surface mm-border rounded-lg p-6 h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between mm-text-muted">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mm-text-muted">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div style={{borderTop: '1px solid rgba(255,255,255,0.08)'}} className="pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="mm-price">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mm-btn mm-btn-primary py-3 font-bold disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="w-full mm-btn mt-3 py-3 font-bold"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
