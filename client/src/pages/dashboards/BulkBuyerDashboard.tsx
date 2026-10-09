import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BuyerRequirement } from '../../types';

export const BulkBuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [productName, setProductName] = useState('Tomatoes');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('5000');
  const [unit, setUnit] = useState('kg');
  const [maxPricePerUnit, setMaxPricePerUnit] = useState('35');
  const [targetLocation, setTargetLocation] = useState('Hyderabad Wholesale Food Processing Terminal');
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/requirements');
      if (res.success) {
        setRequirements(res.requirements || []);
      }
    } catch (err) {
      console.warn('Requirements fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiRequest('/requirements', {
        method: 'POST',
        body: JSON.stringify({
          productName,
          category,
          quantity: Number(quantity),
          unit,
          maxPricePerUnit: Number(maxPricePerUnit),
          targetLocation,
          targetDate,
        }),
      });

      if (res.success) {
        setModalOpen(false);
        fetchRequirements();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post requirement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2">
            <span>🏢 Institutional Bulk Procurement Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Bulk Procurement Officer'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.organization || 'Institutional Procurement Enterprise'} • Automated Smart Matching with Farmers & FPOs
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Bulk Procurement Order</span>
        </button>
      </div>

      {/* Requirements List & Smart Matches */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">
          Your Active Procurement Demands ({requirements.length})
        </h2>

        {requirements.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base">No Bulk Requirements Posted Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create a requirement such as "5,000 kg Tomatoes at max ₹35/kg in Hyderabad" to trigger AI smart matching.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 px-6 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              Post Requirement
            </button>
          </div>
        ) : (
          requirements.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6"
            >
              {/* Requirement Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-black text-slate-900">{req.productName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {req.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                      STATUS: {req.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                    <span>
                      Target Volume: <strong>{req.quantity} {req.unit}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Ceiling Rate: <strong>₹{req.maxPricePerUnit} / {req.unit}</strong>
                    </span>
                    <span>•</span>
                    <span>Location: {req.targetLocation}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Target Delivery Date</div>
                  <div className="text-sm font-bold text-slate-900">
                    {new Date(req.targetDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Matched Suppliers Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI Algorithmic Smart Matches ({req.matchedSuppliers?.length || 0})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Ranked by multi-factor matching score
                  </span>
                </div>

                {req.matchedSuppliers && req.matchedSuppliers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {req.matchedSuppliers.map((supplier, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-emerald-500/50 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-extrabold text-sm text-slate-900">
                              {supplier.supplierName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {supplier.supplierRole} • {supplier.location} ({supplier.distanceKm} km away)
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center space-x-1">
                            <Percent className="w-3.5 h-3.5" />
                            <span>{supplier.matchScore}% Match</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-white rounded-xl border border-slate-200">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Offered Rate:</span>
                            <strong className="text-emerald-700 font-bold">
                              ₹{supplier.offeredPrice} / {req.unit}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Lot Available:</span>
                            <strong className="text-slate-900 font-bold">
                              {supplier.availableQuantity} {req.unit}
                            </strong>
                          </div>
                        </div>

                        {/* Match Factors Breakdown */}
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="font-bold text-slate-700 text-[10px] uppercase">
                            Why this supplier was matched:
                          </div>
                          {supplier.matchReasons?.map((reason, rIdx) => (
                            <div key={rIdx} className="flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            alert(
                              `Direct contact established with ${supplier.supplierName}! Mandi batch reservation request sent.`
                            )
                          }
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                        >
                          Initiate Direct Procurement Deal
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No immediate suppliers within price tolerance. The AI engine is monitoring incoming harvest lots.
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Requirement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Post Bulk Produce Requirement</h3>
            <p className="text-xs text-slate-500">
              Define your target crop, volume, price ceiling, and delivery destination to activate AI matching.
            </p>

            <form onSubmit={handleCreateRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Produce Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomatoes"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Target Volume</label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Max Ceiling Price (₹/unit)</label>
                  <input
                    type="number"
                    required
                    placeholder="35"
                    value={maxPricePerUnit}
                    onChange={(e) => setMaxPricePerUnit(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Delivery Destination / Warehouse</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad Wholesale Cold Hub"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md"
                >
                  {submitting ? 'Matching Suppliers...' : 'Post Requirement & Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
