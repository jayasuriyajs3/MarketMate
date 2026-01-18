import { useState, useEffect } from 'react';
import Header from './Header';
import ProductCard from './ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const categories = ['All', 'Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/products?';
      if (category !== 'All') url += `category=${category}&`;
      if (search) url += `search=${search}&`;
      url += `sortBy=${sortBy}`;

      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen">
        {/* Hero Banner with Image */}
        <div className="relative h-96 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=500&fit=crop)',
              filter: 'brightness(0.5)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
            <div className="max-w-4xl">
              <h1 className="text-6xl font-extrabold mb-4 drop-shadow-2xl">Welcome to MarketMate</h1>
              <p className="text-2xl mb-6 drop-shadow-lg">Your Local Price Comparison Platform</p>
              <p className="text-lg mb-8 opacity-95 drop-shadow-md">Compare prices from neighborhood shops • Find the best deals • Support local businesses</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => document.getElementById('products').scrollIntoView({behavior: 'smooth'})} className="mm-btn mm-btn-primary text-lg px-8 py-3">
                  Browse Products
                </button>
                <button onClick={() => window.location.href='/register'} className="mm-btn text-lg px-8 py-3">
                  Join as Shopkeeper
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 mm-muted-surface">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose MarketMate?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-3">Compare Prices</h3>
                <p className="mm-text-muted">Browse products from multiple local shops and compare prices instantly to find the best deals.</p>
              </div>
              <div className="text-center p-6">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-3">Save Money</h3>
                <p className="mm-text-muted">Get real-time price updates and exclusive discounts from neighborhood stores near you.</p>
              </div>
              <div className="text-center p-6">
                <div className="text-5xl mb-4">🏪</div>
                <h3 className="text-xl font-bold mb-3">Support Local</h3>
                <p className="mm-text-muted">Help your community thrive by shopping from local businesses you know and trust.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-12 mm-surface border-y mm-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-extrabold" style={{color: 'var(--accent)'}}>24+</div>
                <p className="mm-text-muted mt-2">Products</p>
              </div>
              <div>
                <div className="text-4xl font-extrabold" style={{color: 'var(--accent)'}}>8</div>
                <p className="mm-text-muted mt-2">Categories</p>
              </div>
              <div>
                <div className="text-4xl font-extrabold" style={{color: 'var(--accent)'}}>2+</div>
                <p className="mm-text-muted mt-2">Local Shops</p>
              </div>
              <div>
                <div className="text-4xl font-extrabold" style={{color: 'var(--accent)'}}>15%</div>
                <p className="mm-text-muted mt-2">Avg. Savings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="py-12 mm-surface" id="products">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-3 text-center">Find Products</h2>
            <p className="text-center mm-text-muted mb-6">Search across all products from local shops</p>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-8">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products..."
                className="mm-input"
              />
              <button type="submit" className="mm-btn mm-btn-primary px-6">Search</button>
            </form>
          </div>
        </div>

        {/* Filters */}
        <div className="mm-surface mm-border">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center gap-4">
              {/* Categories */}
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-semibold mm-text-muted">Category:</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`mm-pill text-sm ${category === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold mm-text-muted">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mm-select text-sm"
                >
                  <option value="recent">Recent</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="mm-text-muted text-lg">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="mm-text-muted text-lg">No products found</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="mm-text-muted">
                  Showing <span className="font-semibold text-white">{products.length}</span> products
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer / CTA Section */}
        <div className="py-16 mm-muted-surface text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping Smart?</h2>
            <p className="text-lg mm-text-muted mb-8">Join thousands of savvy shoppers comparing prices and supporting local businesses</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => window.location.href='/register'} className="mm-btn mm-btn-primary text-lg px-8 py-3">
                Create Account
              </button>
              <button onClick={() => window.location.href='/login'} className="mm-btn text-lg px-8 py-3">
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mm-surface border-t mm-border py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              <div>
                <h3 className="font-bold text-lg mb-3" style={{color: 'var(--accent)'}}>MarketMate</h3>
                <p className="text-sm mm-text-muted">Your trusted local price comparison platform. Compare prices, save money, support local.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm mm-text-muted">
                  <li><a href="/" className="hover:text-white">Home</a></li>
                  <li><a href="/register" className="hover:text-white">Register</a></li>
                  <li><a href="/login" className="hover:text-white">Login</a></li>
                  <li><a href="/admin" className="hover:text-white">Admin</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Categories</h4>
                <ul className="space-y-2 text-sm mm-text-muted">
                  <li>Groceries</li>
                  <li>Vegetables & Fruits</li>
                  <li>Dairy & Bakery</li>
                  <li>Beverages & Snacks</li>
                </ul>
              </div>
            </div>
            <div className="text-center pt-6 border-t mm-border">
              <p className="text-sm mm-text-muted">&copy; 2026 MarketMate. All rights reserved. Built for local communities.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
