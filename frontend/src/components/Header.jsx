import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useEffect, useState } from 'react';

export default function Header() {
  const authContext = useAuth();
  const { user, setUser } = authContext || { user: null, setUser: null };
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('mm_theme') || 'dark');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('mm-light');
    } else {
      document.body.classList.remove('mm-light');
    }
    localStorage.setItem('mm_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user && user.role !== 'shopkeeper') {
      setCartCount(getTotalItems());
    }
  }, [getTotalItems, user]);

  const logout = () => {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="mm-sticky flex justify-between items-center px-6 py-4 mm-surface mm-border">
      <Link to="/" className="text-2xl font-bold" style={{color: 'var(--accent)'}}>
        MarketMate
      </Link>
      <nav className="flex gap-3 items-center">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
          className="mm-btn"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        {user ? (
          <>
            <Link to="/" className="mm-btn text-sm">Home</Link>
            {user.role === 'shopkeeper' && (
              <Link
                to="/add-product"
                className="mm-btn mm-btn-primary text-sm"
              >
                + Add Product
              </Link>
            )}
            {user.role !== 'admin' && user.role !== 'shopkeeper' && (
              <Link
                to="/cart"
                className="mm-btn text-sm relative"
              >
                🛒 Cart {cartCount > 0 && <span className="ml-1 font-bold" style={{color: 'var(--accent)'}}>{cartCount}</span>}
              </Link>
            )}
            {user.role !== 'admin' && (
              <Link
                to="/profile"
                className="mm-btn text-sm"
              >
                My Profile
              </Link>
            )}
            {user.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="mm-btn mm-btn-primary text-sm"
              >
                Dashboard
              </Link>
            )}
            <button 
              onClick={logout} 
              className="mm-btn mm-btn-danger text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mm-btn text-sm">Login</Link>
            <Link to="/register" className="mm-btn mm-btn-primary text-sm">Register</Link>
            <Link to="/admin/login" className="mm-btn text-sm">Admin</Link>
          </>
        )}
      </nav>
    </header>
  );
}
