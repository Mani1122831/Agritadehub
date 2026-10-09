import React, { useState, useEffect } from 'react';
import {
  Plus,
  Package,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit,
  Sparkles,
  MapPin,
  Tag,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quality, setQuality] = useState('Grade A');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80');
  const [isOrganic, setIsOrganic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, aiRes] = await Promise.all([
        apiRequest('/products?limit=50'),
        apiRequest('/orders'),
        apiRequest('/ai/insights'),
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (orderRes.success) setOrders(orderRes.orders || []);
      if (aiRes.success) setInsights(aiRes.insights || []);
    } catch (err) {
      console.warn('Farmer dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          category,
          description,
          price: Number(price),
          stock: Number(stock),
          unit,
          quality,
          image,
          isOrganic,
          farmerName: user?.name,
          location: user?.location || { city: 'Guntur', state: 'Andhra Pradesh' },
        }),
      });

      if (res.success) {
        setModalOpen(false);
        // Reset form
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to list produce');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <span>🧑‍🌾 Farmer / FPO Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Kisan Producer'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.organization || 'Guntur Kisan Producers Cooperative'} • {user?.location?.city || 'Guntur'}, {user?.location?.state || 'Andhra Pradesh'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Harvest Produce</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Listed Produce</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{products.length} Items</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Direct Farm-Gate Verified</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Dispatched Orders</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{orders.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across Wholesale & Retail</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Harvest Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{products.reduce((sum, p) => sum + p.price * p.stock, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Total Available Inventory</div>
        </div>

        <div className="p-5 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold uppercase">
            <span>AI Price Benchmark</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">+14% Above Mandi</div>
          <div className="text-[11px] text-emerald-300 mt-1">Recommended Holding Window</div>
        </div>
      </div>

      {/* AI Market Advisory Card for Farmers */}
      {insights.length > 0 && (
        <div className="p-5 bg-amber-50/70 border border-amber-200/60 rounded-3xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Harvest & Price Recommendation Advisory</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            {insights.slice(0, 2).map((ins) => (
              <div key={ins.id} className="bg-white p-3.5 rounded-2xl border border-amber-100">
                <div className="font-bold text-slate-900">{ins.commodity}:</div>
                <div className="text-emerald-700 font-bold mt-1">
                  AI Target Range: {ins.recommendedRange} ({ins.demandStatus})
                </div>
                <p className="text-slate-500 text-[11px] mt-1">{ins.recommendedAction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Produce Listings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">
            Your Active Harvest Listings ({products.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Produce</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Quality Grade</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 flex items-center space-x-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <strong className="text-slate-900 block font-bold">{p.name}</strong>
                      <span className="text-[10px] text-slate-400">
                        {p.isOrganic ? '🌿 Organic' : 'Conventional'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4 font-bold text-emerald-700">₹{p.price} / {p.unit}</td>
                  <td className="p-4 font-semibold">{p.stock} {p.unit}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-[10px]">
                      {p.quality}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{p.location?.city || 'Guntur'}, {p.location?.state || 'AP'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete produce"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Produce Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">List New Harvest Produce</h3>
            <p className="text-xs text-slate-500">Provide verified crop details to publish directly to the marketplace.</p>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Crop / Produce Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Guntur Teja Chillies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Spices">Spices</option>
                    <option value="Oil Seeds">Oil Seeds</option>
                    <option value="Organic Products">Organic Products</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Quality Grade</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade A+">Grade A+</option>
                    <option value="Export Quality">Export Quality</option>
                    <option value="Organic Certified">Organic Certified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="35"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="tonne">tonne</option>
                    <option value="crate">crate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description & Harvest Notes</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Harvested at dawn, sun-cured, moisture under 12%..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="org"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="org" className="text-slate-700 font-semibold cursor-pointer">
                  Certified Organic Production
                </label>
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
                  {submitting ? 'Publishing...' : 'Publish to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
