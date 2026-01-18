import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from './AuthContext';

export default function AddProductPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: 'Groceries',
    description: '',
    price: '',
    discount: '0',
    stock: '',
    unit: 'kg',
    imageUrl: '',
  });

  const categories = ['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Other'];
  const units = ['kg', 'gram', 'g', 'liter', 'L', 'ml', 'piece', 'pieces', 'packet', 'pack', 'dozen'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          discount: parseFloat(formData.discount),
          stock: parseFloat(formData.stock),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Product added successfully!');
        navigate('/profile');
      } else {
        alert(data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {user && user.role === 'shopkeeper' && !user.isApproved && (
            <div className="p-4 rounded-lg mb-4" style={{background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.35)', color:'#facc15'}}>
              Your shopkeeper account is pending admin approval. You can browse, but adding products is disabled until approved.
            </div>
          )}
          {user && user.role !== 'shopkeeper' && (
            <div className="p-4 rounded-lg mb-4" style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca'}}>
              Only approved shopkeepers can add products.
            </div>
          )}

          {(!user || user.role !== 'shopkeeper' || !user.isApproved) ? (
            <div className="mm-surface mm-border rounded-lg p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
              <p className="mm-text-muted mb-4">You need an approved shopkeeper account to add products.</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 mm-btn mm-btn-primary"
              >
                Go to Home
              </button>
            </div>
          ) : (
          <div className="mm-surface mm-border rounded-lg p-8">
            <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  className="mm-input"
                  placeholder="e.g., Fresh Tomatoes"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mm-select"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="mm-textarea"
                  placeholder="Product description..."
                />
              </div>

              {/* Price and Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="mm-input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="mm-input"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Stock and Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="mm-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    className="mm-select"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold mb-2">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="mm-input"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs mm-text-muted mt-1">
                  Leave empty for default placeholder image
                </p>
              </div>

              {/* Preview */}
              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image Preview</label>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-lg"
                    style={{border:'1px solid rgba(255,255,255,0.08)'}}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Invalid+Image';
                    }}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 mm-btn mm-btn-primary disabled:opacity-50"
                >
                  {loading ? 'Adding Product...' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-6 py-3 mm-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
