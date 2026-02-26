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
    <header className="mm-sticky flex flex-col sm:flex-row sm:justify-between items-center gap-3 px-3 sm:px-6 py-3 sm:py-4 mm-surface mm-border">
      <Link to="/" className="text-xl sm:text-2xl font-bold" style={{color: 'var(--accent)'}}>
        MarketMate
      </Link>
      <nav className="w-full sm:w-auto flex gap-2 sm:gap-3 items-center flex-wrap justify-center sm:justify-end">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
          className="mm-btn text-xs sm:text-sm px-3 sm:px-4 py-2"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        {user ? (
          <>
            <Link to="/" className="mm-btn text-xs sm:text-sm px-3 sm:px-4 py-2">Home</Link>
            {user.role === 'shopkeeper' && (
              <Link
                to="/add-product"
                className="mm-btn mm-btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                + Add Product
              </Link>
            )}
            {user.role !== 'admin' && user.role !== 'shopkeeper' && (
              <Link
                to="/cart"
                className="mm-btn text-xs sm:text-sm px-3 sm:px-4 py-2 relative"
              >
                🛒 Cart {cartCount > 0 && <span className="ml-1 font-bold" style={{color: 'var(--accent)'}}>{cartCount}</span>}
              </Link>
            )}
            {user.role !== 'admin' && (
              <Link
                to="/profile"
                className="mm-btn text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                My Profile
              </Link>
            )}
            {user.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="mm-btn mm-btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                Dashboard
              </Link>
            )}
            <button 
              onClick={logout} 
              className="mm-btn mm-btn-danger text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mm-btn text-xs sm:text-sm px-3 sm:px-4 py-2">Login</Link>
            <Link to="/register" className="mm-btn mm-btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2">Register</Link>
            <Link to="/admin/login" className="mm-btn text-xs sm:text-sm px-3 sm:px-4 py-2">Admin</Link>
          </>
        )}
      </nav>
    </header>
  );
}
