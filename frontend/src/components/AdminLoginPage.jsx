import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import AuthLayout from './AuthLayout';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/admin/login', { email, password });
      localStorage.setItem('mm_token', data.token);
      localStorage.setItem('mm_user', JSON.stringify(data));
      setUser(data);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Access" subtitle="Manage shopkeeper approvals and platform settings">
      <div className="mm-surface mm-border p-8 rounded-2xl mm-shadow">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold">Admin Login</h2>
          <p className="mm-text-muted text-sm">Access administrative dashboard</p>
        </div>
        {error && <div className="mb-4 p-3" style={{background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', borderRadius:'0.6rem'}}>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@marketmate.com"
              className="mm-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mm-input"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mm-btn mm-btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-xs mm-text-muted">
            <span className="font-semibold">Default credentials:</span> admin@marketmate.com / admin123
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
