import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      if (data.success) {
        // Safe navigation passing email in state & param
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`, { state: { email } });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shadow-sm mb-3">
            ✉️
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Forgot Password
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Enter your registered email. We will generate and send a secure 6-digit verification code directly to your email address.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. kasanimanikanta2005@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>{loading ? 'Sending Code to Email...' : 'Send Verification OTP'}</span>
          </button>
        </form>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-[11px] text-emerald-900 space-y-1">
          <div className="font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Secure Real Email OTP Service</span>
          </div>
          <p className="text-slate-600">
            Codes are hashed, cryptographically randomized, and expire automatically in 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};
