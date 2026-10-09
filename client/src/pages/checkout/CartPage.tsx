import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, subtotal, deliveryFee, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-3xl shadow-sm mb-4">
          🛒
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Explore our marketplace to source fresh produce directly from verified farmers and mandi merchants.
        </p>
        <Link
          to="/marketplace"
          className="mt-6 inline-flex items-center space-x-2 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition-all"
        >
          <span>Explore Produce Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Procurement Cart ({items.length} produce types)
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review your selected farm produce and batch quantities</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:underline font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product._id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                />
                <div>
                  <Link
                    to={`/product/${item.product._id}`}
                    className="font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ₹{item.product.price} / {item.product.unit} • {item.product.farmerName || 'Kisan Group'}
                  </div>
                  <div className="text-xs font-bold text-emerald-700 mt-1 sm:hidden">
                    Subtotal: ₹{item.product.price * item.quantity}
                  </div>
                </div>
              </div>

              {/* Quantity & Delete */}
              <div className="flex items-center space-x-4 shrink-0">
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-800 font-bold hover:bg-slate-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-800 font-bold hover:bg-slate-200 transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="hidden sm:block text-right w-20">
                  <div className="text-sm font-black text-slate-900">
                    ₹{item.product.price * item.quantity}
                  </div>
                  <div className="text-[10px] text-slate-400">Total</div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <Link
            to="/marketplace"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping Produce</span>
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Produce Subtotal:</span>
              <strong className="text-slate-900">₹{subtotal}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Logistics & Freight:</span>
              {deliveryFee === 0 ? (
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  FREE (Order &gt; ₹1000)
                </span>
              ) : (
                <strong className="text-slate-900">₹{deliveryFee}</strong>
              )}
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
              <span>Total Payable:</span>
              <span className="text-emerald-700 text-lg">₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Mandi Dispatch Guarantee</span>
            </div>
            <p>Direct farm pickup and cold-chain temperature preservation included.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
