import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Header() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
      <Link to="/" className="text-xl font-bold text-blue-600">MarketMate</Link>
      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <span className="text-gray-600 font-semibold">Hi, {user.username}</span>
            <button 
              onClick={logout} 
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:border-blue-600 hover:text-blue-600 transition text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:border-blue-600 hover:text-blue-600 transition text-sm"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
