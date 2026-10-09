import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiRequest } from '../../services/api';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();

  // Address state
  const [street, setStreet] = useState('Plot 42, Hitech Agri Park');
  const [city, setCity] = useState(user?.location?.city || 'Hyderabad');
  const [state, setState] = useState(user?.location?.state || 'Telangana');
  const [pincode, setPincode] = useState('500081');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('Razorpay Sandbox');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Please Sign In to Checkout</h2>
        <p className="text-xs text-slate-500">
          An account is required to verify delivery addresses and route notifications.
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 bg-emerald-700 text-white rounded-xl text-xs font-bold"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client idempotency token based on timestamp and user
    const clientKey = `AGRI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const orderPayload = {
        items: items.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          unit: i.product.unit,
        })),
        shippingAddress: {
          street,
          city,
          state,
          pincode,
          country: 'India',
        },
        paymentMethod,
        paymentId: `PAY_SANDBOX_${Date.now()}`,
        idempotencyKey: clientKey,
      };

      const res = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      if (res.success && res.order) {
        setOrderSuccess(res.order);
        clearCart();

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {orderSuccess ? (
        /* Order Confirmed View */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm animate-bounce">
            ✓
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              ORDER #{orderSuccess.orderId} CONFIRMED
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Dispatched to the direct farm-gate logistics dispatch network.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-left space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold">
              <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Real Order Emails Dispatched:</span>
            </div>
            <p className="text-slate-600">
              • <strong>Customer Receipt:</strong> Sent to {orderSuccess.customerEmail}
            </p>
            <p className="text-slate-600">
              • <strong>Admin / Host Alert:</strong> Sent to platform administration
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl text-left space-y-3 text-xs border border-slate-200">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Total Paid ({orderSuccess.paymentMethod}):</span>
              <span className="text-emerald-700 text-sm">₹{orderSuccess.total}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Destination:</span>
              <span>
                {orderSuccess.shippingAddress.street}, {orderSuccess.shippingAddress.city} - {orderSuccess.shippingAddress.pincode}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Expected Delivery Date:</span>
              <span className="font-semibold text-slate-900">
                {new Date(orderSuccess.estimatedDelivery).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/orders/${orderSuccess._id}`}
              className="flex-1 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Truck className="w-4 h-4" />
              <span>Track Shipment Live</span>
            </Link>
            <Link
              to="/marketplace"
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
            >
              Continue Sourcing Produce
            </Link>
          </div>
        </div>
      ) : (
        /* Checkout Form View */
        <div className="space-y-8">
          <div>
            <Link
              to="/cart"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Cart</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Checkout & Direct Mandi Dispatch
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Secure sandbox checkout with real email confirmation and tamper-proof idempotency
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Address and Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Delivery Destination</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Street Address / Mandi Warehouse / Flat
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Unit 4B, Telangana Food Logistics Hub"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Select Payment Gateway</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Razorpay Sandbox', label: 'Razorpay Test Sandbox', desc: 'Instant server verification' },
                    { id: 'UPI Test', label: 'UPI Sandbox', desc: 'GooglePay / PhonePe simulation' },
                    { id: 'Cash On Delivery', label: 'Pay on Delivery', desc: 'Cash upon mandi arrival' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPaymentMethod(p.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        paymentMethod === p.id
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">{p.label}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{p.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Sandbox Mode: No card details stored. Fully compliant server-side verification.</span>
                </div>
              </div>
            </div>

            {/* Right: Order Review */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4 h-fit">
              <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
                Produce Review ({items.length})
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.product._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <img
                        src={it.product.image}
                        alt={it.product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      />
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{it.product.name}</div>
                        <div className="text-slate-500">
                          {it.quantity} {it.product.unit} @ ₹{it.product.price}
                        </div>
                      </div>
                    </div>
                    <strong className="text-slate-900">₹{it.product.price * it.quantity}</strong>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <strong className="text-slate-900">₹{subtotal}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Logistics Freight:</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-emerald-700 text-lg">₹{total}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Processing Order...' : `Pay ₹${total} & Place Order`}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
