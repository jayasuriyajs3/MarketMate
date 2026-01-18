import { useEffect, useState } from 'react';

export default function AuthLayout({ children, title = 'Welcome back', subtitle = 'Local price comparison from trusted neighborhood shops' }) {
  const bg = 'https://static.vecteezy.com/system/resources/thumbnails/069/690/426/small_2x/shopping-cart-filled-with-fresh-produce-bread-dairy-products-and-grocery-list-stands-in-well-lit-supermarket-aisle-showcasing-vibrant-selection-of-food-items-free-photo.jpeg';
  const overlay = 'bg-gradient-to-br from-blue-900/70 via-indigo-900/60 to-purple-900/60';
  const [theme, setTheme] = useState(() => localStorage.getItem('mm_theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') document.body.classList.add('mm-light');
    else document.body.classList.remove('mm-light');
    localStorage.setItem('mm_theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className={`absolute inset-0 ${overlay}`} />

      {/* Decorative blur circles */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* Left hero */}
        <div className="hidden lg:flex items-center justify-center p-10">
          <div className="max-w-lg text-white">
            <div className="mb-6 inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-black">MM</div>
              <span className="text-2xl font-bold tracking-tight">MarketMate</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">{title}</h1>
            <p className="text-white/80 text-lg mb-6">{subtitle}</p>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-center gap-3"><span className="w-2 h-2 bg-emerald-400 rounded-full" />Compare prices across local shops</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 bg-sky-400 rounded-full" />Discover today’s best offers</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 bg-fuchsia-400 rounded-full" />Support neighborhood businesses</li>
            </ul>
          </div>
        </div>

        {/* Right column: form slot (centered) */}
        <div className="flex items-center justify-center p-6 sm:p-8 relative">
          <div className="absolute right-6 top-6">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="mm-btn">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
          </div>
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
