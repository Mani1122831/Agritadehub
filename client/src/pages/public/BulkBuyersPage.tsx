import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Send,
  X,
  FileText,
  BadgeAlert,
  Check
} from 'lucide-react';
import { fallbackBuyers, BulkBuyerDemand } from '../../data/fallbackBuyers';

export const BulkBuyersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTender, setSelectedTender] = useState<BulkBuyerDemand | null>(null);
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [bidForm, setBidForm] = useState({
    supplierName: '',
    supplierPhone: '',
    offeredPrice: '',
    offeredQuantity: '',
    notes: '',
  });

  const categories = useMemo(() => {
    const set = new Set(fallbackBuyers.map((b) => b.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredDemands = useMemo(() => {
    return fallbackBuyers.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        b.buyerName.toLowerCase().includes(q) ||
        b.companyName.toLowerCase().includes(q) ||
        b.productName.toLowerCase().includes(q) ||
        b.deliveryLocation.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenBidModal = (demand: BulkBuyerDemand) => {
    setSelectedTender(demand);
    setBidSubmitted(false);
    setBidForm({
      supplierName: '',
      supplierPhone: '',
      offeredPrice: String(demand.targetMaxPrice),
      offeredQuantity: '100',
      notes: '',
    });
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    setBidSubmitted(true);
    setTimeout(() => {
      setSelectedTender(null);
      setBidSubmitted(false);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-16">
      {/* Bid Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedTender(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {bidSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900">Procurement Offer Submitted!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your batch quote of ₹{bidForm.offeredPrice}/unit has been routed to <strong>{selectedTender.companyName}</strong> procurement division. You will receive an SMS confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                    {selectedTender.tenderId}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Supply Offer for {selectedTender.productName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Buyer: <strong>{selectedTender.companyName}</strong> (Ceiling: ₹{selectedTender.targetMaxPrice}/{selectedTender.unit})
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-200">
                  <div><strong>Delivery Warehouse:</strong> {selectedTender.deliveryLocation}</div>
                  <div><strong>Quality Specs:</strong> {selectedTender.qualitySpecs}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Name / FPO Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ramesh Reddy Kisan FPO"
                      value={bidForm.supplierName}
                      onChange={(e) => setBidForm({ ...bidForm, supplierName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Contact *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98481 00000"
                      value={bidForm.supplierPhone}
                      onChange={(e) => setBidForm({ ...bidForm, supplierPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Offered Quantity ({selectedTender.unit}) *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={bidForm.offeredQuantity}
                      onChange={(e) => setBidForm({ ...bidForm, offeredQuantity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Price per Unit (₹) *</label>
                    <input
                      required
                      type="number"
                      step="0.5"
                      value={bidForm.offeredPrice}
                      onChange={(e) => setBidForm({ ...bidForm, offeredPrice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lot Notes / Moisture Details</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Harvested 4 days ago, moisture tested 10.5%, clean washed"
                    value={bidForm.notes}
                    onChange={(e) => setBidForm({ ...bidForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTender(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Binding Offer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
          <Building2 className="w-3.5 h-3.5 text-amber-800" />
          <span>Institutional B2B Procurement Portal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Enterprise Agricultural Procurement Demands
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          India’s leading retail chains, food manufacturers, and export houses post active purchase tenders here. Farmers and FPOs can review criteria and lock in supply contracts directly.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{fallbackBuyers.length} Tenders</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Active Corporate Demands</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">11,000+ Tonnes</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Open Procurement Volume</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-amber-600">₹45+ Crores</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Total Procurement Budget</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-blue-700">100% Escrow</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Guaranteed Payout Terms</div>
        </div>
      </div>

      {/* Tenders Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search tenders by company, crop, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Crop Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/register?role=buyer"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <span>+ Post New Tender</span>
          </Link>
        </div>
      </div>

      {/* Tenders List */}
      <div className="space-y-4">
        {filteredDemands.map((demand) => (
          <div
            key={demand._id}
            className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <img
                  src={demand.corporateLogo}
                  alt={demand.companyName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {demand.tenderId}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{demand.businessType}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {demand.productName}
                  </h3>
                  <div className="text-xs text-slate-600 font-medium">
                    {demand.companyName} • {demand.buyerName}
                  </div>
                </div>
              </div>

              {/* Price & Quantity Pill */}
              <div className="flex items-center space-x-4 self-end md:self-auto bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Target Volume</div>
                  <div className="text-base font-black text-slate-900">
                    {demand.requiredQuantity} {demand.unit}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Max Ceiling</div>
                  <div className="text-base font-black text-emerald-700">
                    ₹{demand.targetMaxPrice}/{demand.unit}
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications & Delivery Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-600">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Terminal:</span>
                <p className="font-semibold text-slate-800 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{demand.deliveryLocation}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Quality Criteria:</span>
                <p className="font-medium text-slate-800 truncate">{demand.qualitySpecs}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Terms:</span>
                <p className="font-medium text-slate-800 truncate">{demand.paymentTerms}</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Deadline: <strong>{new Date(demand.deliveryDeadline).toLocaleDateString('en-IN')}</strong></span>
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-700">
                  {demand.totalBidsReceived} FPO Bids Received
                </span>
              </div>

              <button
                onClick={() => handleOpenBidModal(demand)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 self-end sm:self-auto"
              >
                <span>Supply This Demand / Place Bid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Institutional Call To Action */}
      <div className="p-8 sm:p-12 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Need Custom Volume Agriculture?</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Post an institutional procurement requirement with automated multi-mandi FPO matching and escrow protection.
          </p>
        </div>
        <Link
          to="/register?role=buyer"
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all shrink-0"
        >
          Open Institutional Account
        </Link>
      </div>
    </div>
  );
};
