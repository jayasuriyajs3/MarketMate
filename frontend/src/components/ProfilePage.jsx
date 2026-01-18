import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './Header';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchMyProducts();
    } else if (activeTab === 'orders') {
      fetchMyOrders();
    }
  }, [activeTab]);

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch('http://localhost:5000/api/products/my/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMyProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMyOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMyProducts(myProducts.filter((p) => p._id !== productId));
        alert('Product deleted successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {user?.role === 'shopkeeper' && !user?.isApproved && (
            <div className="p-4 rounded-lg mb-4" style={{background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.35)', color:'#facc15'}}>
              Your shopkeeper account is pending admin approval. You can view your profile, but product management is disabled until approval.
            </div>
          )}
          {/* Profile Header */}
          <div className="mm-surface mm-border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{user?.shopName}</h1>
                <p className="mm-text-muted mb-1">
                  <span className="font-semibold">Owner:</span> {user?.username}
                </p>
                <p className="mm-text-muted mb-1">
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
                <p className="mm-text-muted mb-1">
                  <span className="font-semibold">Phone:</span> {user?.phoneNumber}
                </p>
                <p className="mm-text-muted">
                  <span className="font-semibold">Address:</span> {user?.address}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 mm-btn mm-btn-danger"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mm-surface mm-border rounded-lg mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 font-semibold transition ${activeTab === 'profile' ? '' : 'mm-text-muted'}`}
                style={activeTab === 'profile' ? {color:'var(--accent)', borderBottom:'2px solid var(--accent)'} : {}}
              >
                Profile Info
              </button>
              {user?.role === 'shopkeeper' && (
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 py-4 px-6 font-semibold transition ${activeTab === 'products' ? '' : 'mm-text-muted'}`}
                  style={activeTab === 'products' ? {color:'var(--accent)', borderBottom:'2px solid var(--accent)'} : {}}
                >
                  My Products
                </button>
              )}
              {user?.role === 'user' && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 py-4 px-6 font-semibold transition ${activeTab === 'orders' ? '' : 'mm-text-muted'}`}
                  style={activeTab === 'orders' ? {color:'var(--accent)', borderBottom:'2px solid var(--accent)'} : {}}
                >
                  My Orders
                </button>
              )}
            </div>

            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 mm-muted-surface rounded-lg">
                      <p className="text-sm mm-text-muted mb-1">Username</p>
                      <p className="text-lg font-semibold">{user?.username}</p>
                    </div>
                    <div className="p-4 mm-muted-surface rounded-lg">
                      <p className="text-sm mm-text-muted mb-1">Shop Name</p>
                      <p className="text-lg font-semibold">{user?.shopName}</p>
                    </div>
                    <div className="p-4 mm-muted-surface rounded-lg">
                      <p className="text-sm mm-text-muted mb-1">Email</p>
                      <p className="text-lg font-semibold">{user?.email}</p>
                    </div>
                    <div className="p-4 mm-muted-surface rounded-lg">
                      <p className="text-sm mm-text-muted mb-1">Phone Number</p>
                      <p className="text-lg font-semibold">{user?.phoneNumber}</p>
                    </div>
                    <div className="p-4 mm-muted-surface rounded-lg md:col-span-2">
                      <p className="text-sm mm-text-muted mb-1">Address</p>
                      <p className="text-lg font-semibold">{user?.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div>
                  {loading ? (
                    <p className="text-center mm-text-muted">Loading products...</p>
                  ) : myProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="mm-text-muted mb-4">You haven't added any products yet</p>
                      <button
                        onClick={() => navigate('/add-product')}
                        className="px-6 py-2 mm-btn mm-btn-primary"
                      >
                        Add Your First Product
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myProducts.map((product) => (
                        <div key={product._id} className="mm-surface mm-border rounded-lg p-4 hover:mm-shadow transition">
                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-bold text-lg mb-1">{product.productName}</h3>
                          <p className="text-sm mm-text-muted mb-2">{product.category}</p>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              {product.discount > 0 ? (
                                <div>
                                  <span className="text-lg font-bold" style={{color:'#86efac'}}>
                                    ₹{product.finalPrice}
                                  </span>
                                  <span className="text-sm mm-strike ml-2">
                                    ₹{product.price}
                                  </span>
                                  <span className="text-xs ml-2" style={{color:'#86efac'}}>
                                    {product.discount}% OFF
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold">₹{product.price}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/edit-product/${product._id}`)}
                              className="flex-1 px-3 py-2 mm-btn mm-btn-primary text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="flex-1 px-3 py-2 mm-btn mm-btn-danger text-sm"
                            >
                              Delete
                            </button>
                          </div>
                          <p className="text-xs mm-text-muted mt-2">
                            Stock: {product.stock} {product.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  {loading ? (
                    <p className="text-center mm-text-muted">Loading orders...</p>
                  ) : myOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="mm-text-muted mb-4">You haven't placed any orders yet</p>
                      <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 mm-btn mm-btn-primary"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.map((order) => (
                        <div key={order._id} className="mm-surface mm-border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm mm-text-muted">Order ID</p>
                              <p className="font-bold">{order._id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-sm mm-text-muted">Date</p>
                              <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm mm-text-muted">Total</p>
                              <p className="font-bold mm-price">₹{order.totalAmount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm mm-text-muted">Status</p>
                              <p className="font-bold capitalize" style={{color: order.status === 'confirmed' ? '#86efac' : '#fdba74'}}>
                                {order.status}
                              </p>
                            </div>
                          </div>
                          <div className="pt-4" style={{borderTop: '1px solid rgba(255,255,255,0.08)'}}>
                            <p className="text-sm mm-text-muted mb-2">Items:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="text-sm mm-muted-surface p-2 rounded">
                                  <p className="font-semibold">{item.productName}</p>
                                  <p className="text-xs">Qty: {item.quantity} | ₹{item.finalPrice}/unit</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
