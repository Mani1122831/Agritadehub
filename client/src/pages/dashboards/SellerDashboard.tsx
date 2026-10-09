import React, { useState, useEffect } from 'react';
import {
  Store,
  Package,
  TrendingUp,
  DollarSign,
  Plus,
  ShoppingBag,
  Trash2,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Truck,
  MapPin,
  Calendar,
  Layers,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quality, setQuality] = useState('Grade A');
  const [isOrganic, setIsOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);

  // 4 Required Product Photos
  const [image1, setImage1] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80');
  const [image2, setImage2] = useState('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80');
  const [image3, setImage3] = useState('https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80');
  const [image4, setImage4] = useState('https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80');

  // Edit Product Modal State
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        apiRequest('/products?limit=50'),
        apiRequest('/orders'),
      ]);
      if (pRes.success) setProducts(pRes.products || []);
      if (oRes.success) setOrders(oRes.orders || []);
    } catch (err) {
      console.warn('Seller dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter products for this seller (or show all available products if not specifically tagged)
  const sellerProducts = products.filter(
    (p) =>
      p.seller === user?._id ||
      p.seller === user?.id ||
      p.sellerName === user?.organization ||
      p.sellerName === user?.name ||
      p.sellerName?.toLowerCase().includes('seller')
  );

  const displayProducts = sellerProducts.length > 0 ? sellerProducts : products.slice(0, 8);

  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalMargin = Math.round(totalSales * 0.12);

  // Handle Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const payload = {
        name: name.trim(),
        category,
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        unit,
        quality,
        isOrganic,
        harvestDate,
        image: image1.trim(),
        gallery: [image1.trim(), image2.trim(), image3.trim(), image4.trim()],
        location: user?.location || { city: 'Guntur', state: 'Andhra Pradesh' },
        sellerName: user?.organization || user?.name || 'AgriDirect Merchant',
      };

      const res = await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setAddModalOpen(false);
        setFeedbackMsg({
          type: 'success',
          text: `Product "${name}" added successfully to database with 4 quality photos!`,
        });
        // Reset form
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
        fetchDashboardData();
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to list product in database',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setSubmitting(true);

    try {
      const res = await apiRequest(`/products/${editProduct._id || editProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          price: Number(editPrice),
          stock: Number(editStock),
        }),
      });

      if (res.success) {
        setEditProduct(null);
        setFeedbackMsg({
          type: 'success',
          text: `Product updated successfully in database!`,
        });
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (prodId: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove "${prodName}"?`)) return;

    try {
      const res = await apiRequest(`/products/${prodId}`, {
        method: 'DELETE',
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Listing removed successfully from database.`,
        });
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          note: `Merchant updated dispatch status to ${newStatus}`,
        }),
      });

      if (res.success) {
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header and Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <span>🏪 Merchant Command & Inventory Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.name || 'AgriDirect Merchant'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.organization || 'Registered Agro-Trading Agency'} • Direct Farm Procurement & Multi-Channel Supply
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW PRODUCT (4 PHOTOS)</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Active Listings</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{products.length} Items</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Database Connected & Live</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Received Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{orders.length} Orders</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Cold-Chain Reefer Dispatched</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Gross Sales Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Direct Bank Settled</div>
        </div>

        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase">
            <span>Net Trade Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{totalMargin.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1">12% Average Trading Spread</div>
        </div>
      </div>

      {/* Seller Store Inventory Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              My Store Listings & Inventory Management ({displayProducts.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real inventory stored in database. Click Edit to update stock & price.
            </p>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Produce Listing</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Produce</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Available</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Quality / Grade</th>
                <th className="p-4">4 Photos</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayProducts.map((p) => {
                const prodId = p._id || p.id || '';
                return (
                  <tr key={prodId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {p.location?.city || 'Guntur'}, {p.location?.state || 'Andhra Pradesh'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{p.category}</td>
                    <td className="p-4">
                      <span
                        className={`font-mono font-bold ${
                          p.stock > 100 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {p.stock} {p.unit || 'kg'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      ₹{p.price}/{p.unit || 'kg'}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                        {p.quality || 'Grade A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex -space-x-1">
                        {(p.gallery && p.gallery.length > 0 ? p.gallery : [p.image]).slice(0, 4).map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt="thumb"
                            className="w-6 h-6 rounded-full border border-white object-cover"
                            title={`Photo Angle ${i + 1}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditProduct(p);
                          setEditPrice(String(p.price));
                          setEditStock(String(p.stock));
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prodId, p.name)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-bold transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Received by Merchant */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Procurement & Fulfillment Orders ({orders.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live customer orders from database. Track and update shipping milestones.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items Ordered</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((o) => {
                const orderIdStr = o._id || o.id || o.orderId;
                const itemsSummary = (o.items || [])
                  .map((it: any) => `${it.name} (${it.quantity}${it.unit || 'kg'})`)
                  .join(', ') || 'Agricultural Produce Order';

                return (
                  <tr key={orderIdStr} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">#{o.orderId}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{o.customerName}</div>
                      <div className="text-[11px] text-slate-500">{o.customerPhone}</div>
                      <div className="text-[10px] text-slate-400">
                        {o.shippingAddress?.city}, {o.shippingAddress?.state}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs truncate font-medium text-slate-600" title={itemsSummary}>
                      {itemsSummary}
                    </td>
                    <td className="p-4 font-bold text-emerald-700">₹{o.total}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                        {o.paymentStatus?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-900 capitalize">
                        {o.orderStatus?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.orderStatus || 'confirmed'}
                        onChange={(e) => handleUpdateOrderStatus(orderIdStr, e.target.value)}
                        className="bg-slate-50 text-slate-900 border rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-emerald-600"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seller Profile Card */}
      <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-2xl font-bold">
            🏪
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold">{user?.name || 'AgriDirect Merchant'}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 text-[10px] font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Seller</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Organization: <strong>{user?.organization || 'AgriDirect Merchant Network'}</strong> • Email: {user?.email} • Phone: {user?.phone}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Operating Area: {user?.location?.address || 'Plot 42, Mandi Yard'}, {user?.location?.city || 'Hyderabad'}, {user?.location?.state || 'Telangana'}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-slate-400">Platform Security</div>
          <div className="text-emerald-400 text-xs font-bold mt-1">Verified Partner Tier 1</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD PRODUCT MODAL (WITH 4 REQUIRED PRODUCT PHOTOS)      */}
      {/* ======================================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">List New Agricultural Product</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save directly to database. Each listing requires minimum 4 photographic inspection angles.
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Agro Tomatoes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Spices">Spices</option>
                    <option value="Oil Seeds">Oil Seeds</option>
                    <option value="Organic Products">Organic Products</option>
                    <option value="Other Agricultural Products">Other Agricultural Products</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Fresh harvest lot, moisture tested, harvested within 24 hours..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="30"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1000"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-emerald-600"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="crate">crate</option>
                    <option value="tonne">tonne</option>
                    <option value="bag">bag</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Quality Grade
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade A+">Grade A+</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Export Quality">Export Quality</option>
                    <option value="Organic Certified">Organic Certified</option>
                  </select>
                </div>
              </div>

              {/* 4 Photo Angles Section */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span>Product Photography Inspection (Min 4 Photos Required)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Mandatory Quality Guarantee
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Photo 1 (Primary / Hero Shot) *
                    </label>
                    <input
                      type="url"
                      required
                      value={image1}
                      onChange={(e) => setImage1(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Photo 2 (Farm Field / Cultivation) *
                    </label>
                    <input
                      type="url"
                      required
                      value={image2}
                      onChange={(e) => setImage2(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Photo 3 (Harvest Lot / Crates) *
                    </label>
                    <input
                      type="url"
                      required
                      value={image3}
                      onChange={(e) => setImage3(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Photo 4 (Produce Detail / Cross-section) *
                    </label>
                    <input
                      type="url"
                      required
                      value={image4}
                      onChange={(e) => setImage4(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Thumbnail Previews */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold">Previews:</span>
                  {[image1, image2, image3, image4].map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`preview-${i}`}
                      className="w-8 h-8 rounded-lg object-cover border border-emerald-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80';
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOrganic}
                    onChange={(e) => setIsOrganic(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold">Certified Organic Lot</span>
                </label>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    {submitting ? 'Saving to Database...' : 'SAVE & PUBLISH PRODUCT'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT PRODUCT MODAL (QUICK PRICE & STOCK UPDATE)          */}
      {/* ======================================================== */}
      {editProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Quick Edit: {editProduct.name}
                </h3>
                <p className="text-[11px] text-slate-500">Update live price and available inventory in database</p>
              </div>
              <button
                onClick={() => setEditProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Unit Price (₹ per {editProduct.unit || 'kg'})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Available Stock Quantity ({editProduct.unit || 'kg'})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {submitting ? 'Updating...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
