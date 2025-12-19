import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">MarketMate</h1>
        <p className="text-gray-600 mb-6">Local price comparison & offers platform</p>
        <div className="flex gap-3 justify-center">
          <Link 
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" 
            to="/login"
          >
            Login
          </Link>
          <Link 
            className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:border-blue-600 hover:text-blue-600 transition" 
            to="/register"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
