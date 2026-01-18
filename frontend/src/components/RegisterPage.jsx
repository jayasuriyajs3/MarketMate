import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import AuthLayout from './AuthLayout';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    shopName: '',
    phoneNumber: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = form.role === 'shopkeeper'
        ? form
        : { username: form.username, email: form.email, password: form.password, role: form.role };

      const { data } = await axios.post('http://localhost:5000/api/auth/register', payload);
      localStorage.setItem('mm_token', data.token);
      localStorage.setItem('mm_user', JSON.stringify(data));
      setUser(data);
      if (data.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.role === 'shopkeeper') {
        navigate('/profile', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join MarketMate as a customer or shopkeeper">
      <div className="w-full mm-surface mm-border p-8 rounded-2xl mm-shadow">
        <h2 className="text-2xl font-extrabold mb-2">Create Account</h2>
        <p className="mm-text-muted mb-6 text-sm">Choose your role to continue</p>
        {error && <div className="mb-4 p-3" style={{background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', borderRadius:'0.6rem'}}>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'user' })}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  form.role === 'user' ? 'mm-btn mm-btn-primary' : 'mm-btn'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'shopkeeper' })}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  form.role === 'shopkeeper' ? 'mm-btn mm-btn-primary' : 'mm-btn'
                }`}
              >
                Shopkeeper
              </button>
            </div>
            {form.role === 'shopkeeper' && (
              <p className="text-xs mt-2" style={{color:'#fdba74'}}>
                Shopkeeper registrations require admin approval before adding products.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Username</label>
            <input
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              className="mm-input"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              className="mm-input"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              className="mm-input"
              required 
            />
          </div>

          {form.role === 'shopkeeper' && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1">Shop Name</label>
                <input
                  name="shopName" 
                  value={form.shopName} 
                  onChange={handleChange} 
                  className="mm-input"
                  required={form.role === 'shopkeeper'} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Phone Number</label>
                <input
                  name="phoneNumber" 
                  value={form.phoneNumber} 
                  onChange={handleChange} 
                  className="mm-input"
                  required={form.role === 'shopkeeper'} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Address</label>
                <textarea
                  name="address" 
                  value={form.address} 
                  onChange={handleChange} 
                  rows={2}
                  className="mm-textarea resize-none"
                  required={form.role === 'shopkeeper'} 
                />
              </div>
            </>
          )}

          <button
            type="submit" 
            className="w-full mm-btn mm-btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-sm mm-text-muted">
            Already have an account? <Link to="/login" className="font-semibold" style={{color:'var(--accent)'}}>Login</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
