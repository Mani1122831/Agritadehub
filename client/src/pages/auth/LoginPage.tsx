import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ShieldAlert, Sparkles, User, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const state = (location.state as any) || {};
  const isRegistered = searchParams.get('registered') === 'true' || !!state.registeredEmail;
  const initialEmail = state.registeredEmail || searchParams.get('email') || '';
  const successMessage = state.successMessage || 'Account created successfully! Please log in to continue.';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // As requested: user creates account -> goes to login page -> goes to home page
      const redirectUrl = searchParams.get('redirect') || '/';
      navigate(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('AgriTrade@2026');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto text-xl shadow-md mb-3">
            🌾
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to AgriTrade Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your agricultural marketplace account & role dashboard
          </p>
        </div>

        {isRegistered && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block">Account Created Successfully!</strong>
              <span className="text-[11px] text-emerald-700">Please sign in with your email and password to access your role dashboard.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Registered Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'LOGIN'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-700 hover:underline">
            Create Account
          </Link>
        </div>

        {/* Quick Demo Credentials Box for Evaluators */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-slate-700 flex items-center space-x-1 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Test Demo Logins (Password: AgriTrade@2026):</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo('farmer.ramesh@agritradehub.ai')}
              className="p-1.5 text-left bg-white border hover:border-emerald-500 rounded-lg text-slate-800"
            >
              🧑‍🌾 <strong>Farmer:</strong> Ramesh
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('seller.suresh@agritradehub.ai')}
              className="p-1.5 text-left bg-white border hover:border-emerald-500 rounded-lg text-slate-800"
            >
              🏪 <strong>Seller:</strong> Suresh
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('consumer.anita@agritradehub.ai')}
              className="p-1.5 text-left bg-white border hover:border-emerald-500 rounded-lg text-slate-800"
            >
              🛒 <strong>Consumer:</strong> Anita
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('buyer.reliance@agritradehub.ai')}
              className="p-1.5 text-left bg-white border hover:border-emerald-500 rounded-lg text-slate-800"
            >
              🏢 <strong>Bulk Buyer:</strong> Reliance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
