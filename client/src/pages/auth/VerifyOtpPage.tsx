import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { KeyRound, ShieldAlert, ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VerifyOtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, forgotPassword } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const initialEmail = (location.state as any)?.email || searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 minutes

  // Countdown timer for expiry & resend cooldown
  useEffect(() => {
    const timer = setInterval(() => {
      setExpirySeconds((s) => (s > 0 ? s - 1 : 0));
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      if (res.success) {
        // Safe navigation to reset password page via state, never exposing OTP in URL
        navigate(`/reset-password?email=${encodeURIComponent(email)}`, { state: { email, otp } });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setResending(true);
    try {
      await forgotPassword(email);
      setResendCooldown(60);
      setExpirySeconds(300);
      setOtp('');
      alert('A new 6-digit verification code has been dispatched to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div>
          <Link
            to="/forgot-password"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Email</span>
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shadow-sm mb-3">
            🔐
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Verify Email Code
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            We sent a 6-digit code to <strong className="text-slate-800">{email || 'your email'}</strong>. Enter it below to proceed.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                6-Digit Verification OTP
              </label>
              <div className="text-xs font-bold text-amber-700 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Expires in {formatTime(expirySeconds)}</span>
              </div>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              autoFocus
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[10px] font-mono text-2xl font-bold bg-slate-50 text-slate-900 py-3 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || expirySeconds === 0}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Verifying OTP...' : 'Verify Code & Proceed'}</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
          <span>Didn't receive the email?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            className="font-bold text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
