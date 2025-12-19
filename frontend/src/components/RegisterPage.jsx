import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
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
      const { data } = await axios.post('http://localhost:3000/api/auth/register', form);
      localStorage.setItem('mm_token', data.token);
      localStorage.setItem('mm_user', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Shopkeeper Account</h2>
        <p className="text-gray-600 mb-6 text-sm">Start listing your products and offers</p>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Username</label>
            <input 
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Shop Name</label>
            <input 
              name="shopName" 
              value={form.shopName} 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Phone Number</label>
            <input 
              name="phoneNumber" 
              value={form.phoneNumber} 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Address</label>
            <textarea 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
