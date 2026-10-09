import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  Heart,
  Star,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';

export const ConsumerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/orders/my')
      .then((res) => {
        if (res.success) setOrders(res.orders || []);
      })
      .catch((err) => console.warn('Consumer orders fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
          <span>🛒 Consumer & Household Dashboard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {user?.name || 'Customer'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {user?.email} • Destination: {user?.location?.city || 'Bengaluru'}, {user?.location?.state || 'Karnataka'}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Orders</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{orders.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Direct Farm Sourced</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Active Shipments</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {orders.filter((o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">In Cold Transit</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Sourcing Spend</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Zero Intermediary Markup</div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/marketplace"
          className="p-5 bg-emerald-700 text-white rounded-2xl shadow-md hover:bg-emerald-800 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-sm">Explore Fresh Harvest</div>
            <div className="text-xs text-emerald-200 mt-0.5">Vegetables, fruits & grains</div>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>

        <Link
          to="/orders"
          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-sm text-slate-900">Track Current Shipments</div>
            <div className="text-xs text-slate-500 mt-0.5">Live fleet GPS & milestones</div>
          </div>
          <Truck className="w-5 h-5 text-emerald-700" />
        </Link>

        <Link
          to="/ai"
          className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-sm text-slate-900">AI Price & Voice Chat</div>
            <div className="text-xs text-slate-500 mt-0.5">Find produce below target rate</div>
          </div>
          <Star className="w-5 h-5 text-amber-500" />
        </Link>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">Recent Farm Orders</h3>
          <Link to="/orders" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">You haven't placed any produce orders yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 3).map((o) => (
              <div key={o._id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">#{o.orderId}</div>
                  <div className="text-slate-500">
                    {o.items.length} produce lots • Total: ₹{o.total}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 uppercase">
                    {o.orderStatus.replace('_', ' ')}
                  </span>
                  <Link
                    to={`/orders/${o._id}`}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
