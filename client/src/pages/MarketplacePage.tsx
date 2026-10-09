import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { apiRequest } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';
import { fallbackProducts } from '../data/fallbackProducts';

const CATEGORIES = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Spices',
  'Oil Seeds',
  'Organic Products',
  'Other Agricultural Products',
];

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(fallbackProducts.length);

  // Filter States
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [isOrganic, setIsOrganic] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search.trim()) params.append('search', search.trim());
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);
      if (isOrganic) params.append('isOrganic', 'true');

      const data = await apiRequest(`/products?${params.toString()}`);
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalCount(data.total ?? data.products.length);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('API fetch failed, applying resilient catalog search:', err);
    }

    // High-fidelity local fallback search
    let list = [...fallbackProducts];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.location?.city && p.location.city.toLowerCase().includes(q)) ||
          (p.location?.state && p.location.state.toLowerCase().includes(q)) ||
          (p.farmerName && p.farmerName.toLowerCase().includes(q)) ||
          (p.sellerName && p.sellerName.toLowerCase().includes(q))
      );
    }
    if (category && category !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
    if (isOrganic) list = list.filter((p) => p.isOrganic);

    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);

    setProducts(list);
    setTotalCount(list.length);
    setLoading(false);
  };

  useEffect(() => {
    const qSearch = searchParams.get('search') || '';
    const qCategory = searchParams.get('category') || 'All';
    setSearch(qSearch);
    setCategory(qCategory);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [category, search, sort, isOrganic]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleReset = () => {
    setCategory('All');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setIsOrganic(false);
    setSearchParams({});
    setTimeout(() => fetchProducts(), 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Top Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Agricultural Marketplace & Digital Mandi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Direct farm-gate produce catalog. Verified batch certificates, transparent pricing, and instant booking.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              category === cat
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search crop name, location, or variety (e.g. Tomatoes, Guntur, Basmati)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </form>

        {/* Filter dropdowns */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Organic Only</span>
          </label>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="newest">Sort: Newly Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          <button
            onClick={handleReset}
            className="p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse">
              <div className="aspect-[4/3] bg-slate-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="text-xs text-slate-500 font-semibold mb-4">
            Showing {products.length} of {totalCount} verified listings
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl mb-4">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Produce Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            We couldn't find any produce listings matching your active filters. Try searching for "Tomatoes", "Onions", or resetting your filters.
          </p>
          <button
            onClick={handleReset}
            className="mt-6 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
