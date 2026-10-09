import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { Order } from '../../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/orders/my')
      .then((res) => {
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      })
      .catch((err) => console.warn('Orders fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800">Delivered</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">Out for Delivery</span>;
      case 'dispatched':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Dispatched</span>;
      case 'packed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">Packed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Confirmed</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mx-auto mb-6"></div>
        <div className="space-y-4">
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Procurement Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Traceable farm-to-doorstep orders with real-time temperature logs and dispatch milestones
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl mb-4">
            📦
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse our agricultural produce catalog and place your first direct farm order.
          </p>
          <Link
            to="/marketplace"
            className="mt-6 inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    #{order.orderId}
                  </span>
                  {getStatusBadge(order.orderStatus)}
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {order.items.length} items:
                  </span>
                  <span className="truncate max-w-md">
                    {order.items.map((it) => `${it.name} (${it.quantity} ${it.unit})`).join(', ')}
                  </span>
                </div>

                <div className="text-xs text-slate-500">
                  Destination: {order.shippingAddress.city}, {order.shippingAddress.state} • Total Paid:{' '}
                  <strong className="text-emerald-700">₹{order.total}</strong>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
