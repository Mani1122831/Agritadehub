import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User as UserIcon,
  Bell,
  Search,
  Menu,
  X,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Truck,
  Layers,
  ArrowRight,
  Mic,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { fallbackProducts } from '../../data/fallbackProducts';
import { Product } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live instant autocomplete search filtering
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }

    const filtered = fallbackProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.location?.city && p.location.city.toLowerCase().includes(q)) ||
        (p.location?.state && p.location.state.toLowerCase().includes(q)) ||
        (p.farmerName && p.farmerName.toLowerCase().includes(q)) ||
        (p.sellerName && p.sellerName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );

    setSearchResults(filtered.slice(0, 6)); // Top 6 instant matches
    setDropdownOpen(true);
  }, [searchQuery]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setDropdownOpen(false);
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setDropdownOpen(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'farmer':
        return '/farmer/dashboard';
      case 'seller':
        return '/seller/dashboard';
      case 'buyer':
        return '/buyer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/consumer/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center space-x-2">
        <span className="bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          SIH 2026 • SIH26033
        </span>
        <span>From Farm to Market. One Intelligent Agricultural Platform.</span>
      </div>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2 lg:gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight flex items-center">
                AGRITRADE<span className="text-emerald-600 ml-1">HUB</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-black bg-amber-500 text-white rounded">
                  AI
                </span>
              </span>
              <span className="text-[10px] block text-slate-500 font-semibold -mt-1 tracking-wide">
                Digital Mandi & Supply Engine
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar with Live Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[140px] max-w-[200px] xl:max-w-xs 2xl:max-w-sm">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search produce (tomatoes, basmati, mangoes)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setDropdownOpen(true);
                }}
                className="w-full bg-slate-100 text-slate-900 pl-10 pr-9 py-2.5 rounded-full text-xs sm:text-sm border border-slate-200 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDropdownOpen(false);
                  }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Live Autocomplete Dropdown Popup - Wide & Non-Overlapping */}
            {dropdownOpen && (
              <div className="absolute left-0 w-[92vw] sm:w-[500px] md:w-[560px] max-w-[92vw] top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {searchResults.length > 0 ? (
                  <div>
                    <div className="p-3 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 flex justify-between items-center">
                      <span className="uppercase tracking-wider">VERIFIED PRODUCE MATCHES ({searchResults.length})</span>
                      <span className="text-emerald-700 font-semibold">Click to view lot</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {searchResults.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleSelectProduct(item._id || item.id || item.productId || '')}
                          className="p-3.5 hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between gap-3.5 transition-colors group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <img
                              src={item.images?.[0] || item.image}
                              alt={item.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                                  {item.name}
                                </h4>
                                {item.isOrganic && (
                                  <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                                    🌿 Organic
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold">
                                  {item.category}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  {item.location.city}, {item.location.state}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <div className="text-sm font-black text-emerald-700">
                              ₹{item.price}<span className="text-xs font-semibold text-slate-500">/{item.unit}</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                              Stock: <span className="text-slate-800">{item.stock} {item.unit}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full p-3 bg-slate-100 hover:bg-emerald-700 hover:text-white text-slate-700 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 border-t border-slate-200"
                    >
                      <span>View all results for "{searchQuery}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    <p className="font-semibold text-sm text-slate-700">No direct match found for "{searchQuery}"</p>
                    <p className="text-[11px] text-slate-400 mt-1.5">Press Enter to search the entire agricultural catalog.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3.5 2xl:space-x-5 text-xs xl:text-sm font-semibold text-slate-700 shrink-0">
            <Link to="/" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Home
            </Link>
            <Link to="/marketplace" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Marketplace
            </Link>
            <Link to="/farmers" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Farmers
            </Link>
            <Link to="/sellers" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Sellers
            </Link>
            <Link to="/bulk-buyers" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Bulk Buyers
            </Link>
            <Link
              to="/ai"
              className="hover:text-emerald-600 flex items-center space-x-1 text-emerald-700 transition-colors bg-emerald-50 px-2 py-1 rounded-lg whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Insights</span>
            </Link>
            <Link to="/voice-agent" className="hover:text-emerald-600 flex items-center space-x-1 text-slate-700 transition-colors whitespace-nowrap">
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voice AI</span>
            </Link>
            <Link to="/logistics" className="hover:text-emerald-600 flex items-center space-x-1 text-slate-700 transition-colors whitespace-nowrap">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Logistics</span>
            </Link>
          </nav>

          {/* User Controls & Cart */}
          <div className="flex items-center space-x-2 xl:space-x-3 shrink-0">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline capitalize">{user.role} Portal</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all hover:scale-105 whitespace-nowrap shrink-0"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Marketplace
            </Link>
            <Link
              to="/farmers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Farmers & FPOs
            </Link>
            <Link
              to="/sellers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Mandi Sellers
            </Link>
            <Link
              to="/bulk-buyers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Bulk Buyers
            </Link>
            <Link
              to="/ai"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Market Insights</span>
            </Link>
            <Link
              to="/voice-agent"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center space-x-2"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
              <span>Voice AI Assistant</span>
            </Link>
            <Link
              to="/logistics"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center space-x-2"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Smart Logistics & Routing</span>
            </Link>
            {user ? (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-emerald-700 text-white font-bold"
              >
                Go to {user.role.toUpperCase()} Dashboard
              </Link>
            ) : (
              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-xl border border-slate-300 text-slate-800 text-sm font-bold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-xl bg-emerald-700 text-white text-sm font-bold shadow-md"
                >
                  Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
