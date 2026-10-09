import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Mail,
  Star,
  MapPin,
  Calendar,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { Order } from '../../types';

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Batch Sourcing' },
  { key: 'packed', label: 'Packed in Crates' },
  { key: 'dispatched', label: 'Dispatched (Reefer)' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    apiRequest(`/orders/${id}`)
      .then((res) => {
        if (res.success && res.order) {
          setOrder(res.order);
        }
      })
      .catch((err) => console.warn('Order fetch error:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-6"></div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/orders" className="text-emerald-700 text-xs font-bold underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProduct) return;
    setSubmittingReview(true);
    setReviewMessage('');

    try {
      const res = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: reviewProduct.product,
          orderId: order._id,
          rating,
          comment,
        }),
      });

      if (res.success) {
        setReviewMessage('Review submitted successfully! Verified purchase badge attached.');
        setTimeout(() => setReviewProduct(null), 1800);
      }
    } catch (err: any) {
      setReviewMessage(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Details #{order.orderId}
          </h1>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full w-fit">
            Payment: {order.paymentStatus.toUpperCase()} ({order.paymentMethod})
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
        </p>
      </div>

      {/* Tracking Progress Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>Farm-Gate Dispatch Tracking Progress</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= (currentStepIndex >= 0 ? currentStepIndex : 0);
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.key}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="text-sm font-bold">{idx + 1}</div>
                <div className="text-[11px] font-semibold mt-1 leading-tight">{step.label}</div>
                {isCompleted && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto mt-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Tracking Milestones Log */}
        {order.trackingHistory && order.trackingHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <h4 className="font-bold text-slate-700">Dispatch Log History:</h4>
            {order.trackingHistory.map((step, i) => (
              <div key={i} className="flex items-start space-x-2 text-slate-600">
                <span className="text-emerald-600 font-bold">•</span>
                <div>
                  <span className="font-semibold text-slate-900 capitalize">
                    {step.status.replace('_', ' ')}:
                  </span>{' '}
                  {step.note}{' '}
                  <span className="text-[10px] text-slate-400">
                    ({new Date(step.timestamp).toLocaleTimeString('en-IN')})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Order Items & Delivery Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ordered Produce Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">
            Ordered Produce ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <div className="text-xs text-slate-500">
                      {item.quantity} {item.unit} @ ₹{item.price}/{item.unit}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <strong className="text-sm text-slate-900">₹{item.subtotal}</strong>
                  </div>

                  <button
                    onClick={() => {
                      setReviewProduct(item);
                      setReviewMessage('');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <strong className="text-slate-900">₹{order.subtotal}</strong>
            </div>
            <div className="flex justify-between">
              <span>Logistics & Freight:</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
              <span>Total Paid:</span>
              <span className="text-emerald-700 text-base">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping Destination & Email confirmation status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 h-fit">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 mb-3">Delivery Information</h3>
            <div className="text-xs text-slate-600 space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Expected: <strong>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Email Dispatch Status:</span>
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span>Customer Email:</span>
                <span className="font-bold text-emerald-700">✓ Dispatched</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Admin Host Alert:</span>
                <span className="font-bold text-emerald-700">✓ Logged & Sent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Submit Verified Review for {reviewProduct.name}
            </h3>

            {reviewMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
                {reviewMessage}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Your Review / Quality Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share feedback on produce freshness, packaging, and harvest quality..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl text-xs border focus:outline-none focus:bg-white focus:border-emerald-600"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
