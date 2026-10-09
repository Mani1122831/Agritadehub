import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'consumer');
  const [organization, setOrganization] = useState('');
  const [address, setAddress] = useState('Plot 42, Market Yard');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const regUser = await register({
        name,
        email,
        phone,
        role,
        organization,
        address,
        city,
        state,
        location: { address, city, state },
        password,
        confirmPassword,
      });

      setSuccessMsg(`Account created successfully! Taking you to login page...`);
      setTimeout(() => {
        navigate('/login', {
          state: {
            registeredEmail: email,
            successMessage: 'Account created successfully! Please sign in with your credentials to access the platform.',
          },
        });
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto text-xl shadow-md mb-3">
            🌱
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Join the digital agricultural network connecting farms, merchants, and buyers
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Your Platform Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'consumer', label: 'Consumer', icon: '🛒' },
                { id: 'farmer', label: 'Farmer / FPO', icon: '🧑‍🌾' },
                { id: 'seller', label: 'Seller', icon: '🏪' },
                { id: 'buyer', label: 'Bulk Buyer', icon: '🏢' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    role === r.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="text-lg">{r.icon}</div>
                  <div className="text-[11px] mt-0.5">{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Ramesh Reddy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98480 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="ramesh@kisanproduce.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Address / Locality / Market Yard
            </label>
            <input
              type="text"
              required
              placeholder="Plot 42, APMC Mandi Yard"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                City / District
              </label>
              <input
                type="text"
                required
                placeholder="Guntur"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                State
              </label>
              <input
                type="text"
                required
                placeholder="Andhra Pradesh"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          {role !== 'consumer' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Farm / Organization / Enterprise Name
              </label>
              <input
                type="text"
                placeholder="e.g. Guntur Kisan Producer Company Ltd"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Registering Account...' : 'CREATE ACCOUNT'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};
