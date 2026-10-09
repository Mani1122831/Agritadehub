import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Truck,
  Store,
  ChevronRight,
  CheckCircle,
  Package,
  Filter,
  Users,
  Award,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { RouteMap } from '../components/common/RouteMap';
import { Product } from '../types';
import { fallbackProducts } from '../data/fallbackProducts';
import { CinematicScrollCanvas } from '../components/home/CinematicScrollCanvas';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    apiRequest('/products')
      .then((res) => {
        if (res.success && res.products && res.products.length > 0) {
          setProducts(res.products);
        }
      })
      .catch((err) => console.warn('Products sync fallback used:', err));

    apiRequest('/ai/insights')
      .then((res) => {
        if (res.success && res.insights) {
          setInsights(res.insights);
        }
      })
      .catch((err) => console.warn('AI insights fetch fallback used:', err));
  }, []);

  const categories = [
    { label: 'All Commodities', value: 'All' },
    { label: 'Vegetables', value: 'Vegetables' },
    { label: 'Fruits', value: 'Fruits' },
    { label: 'Grains', value: 'Grains' },
    { label: 'Spices', value: 'Spices' },
    { label: 'Pulses', value: 'Pulses' },
    { label: 'Oil Seeds & Cash Crops', value: 'Oil Seeds' },
  ];

  const displayedProducts =
    selectedCategory === 'All'
      ? products
      : products.filter(
          (p) =>
            p.category.toLowerCase() === selectedCategory.toLowerCase() ||
            (selectedCategory === 'Oil Seeds' &&
              (p.category.toLowerCase().includes('oil') ||
                p.category.toLowerCase().includes('other')))
        );

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 w-full max-w-full">
      {/* ========================================================= */}
      {/* SECTION 1: HERO (Clean, Premium, High-Speed)             */}
      {/* ========================================================= */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-emerald-950/80 to-slate-950 text-white border-b border-emerald-900/30">
        {/* Subtle decorative agricultural glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16 z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide uppercase mb-6 shadow-lg shadow-emerald-950/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SIH 2026 Problem SIH26033 • AI Digital Agriculture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            From Farm to Market. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              One Intelligent Platform.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 mb-10 leading-relaxed font-normal">
            Connect farmers, sellers, consumers, and bulk institutional buyers through an AI-powered agricultural marketplace with real-time mandi prices, zero-hallucination inventory intelligence, and optimized cold-chain logistics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#products-section"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-emerald-900/40 hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore All Produce Items</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              to="/register?role=farmer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold text-sm tracking-wide transition-all flex items-center justify-center space-x-2"
            >
              <span>Join as Farmer / FPO</span>
            </Link>
          </div>

          {/* Quick Stats Strip (Clean, Professional, No Video Labels) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 pt-8 border-t border-slate-800/80 text-left backdrop-blur-sm bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <div>
              <div className="text-2xl font-black text-white">{products.length}+ Items</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Verified Produce Commodities</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">Direct Farm</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Zero Middleman Commission</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-400">Gemini Flash</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Grounded Mandi AI Model</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">24/7 Voice</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Indian Speech Recognition</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CINEMATIC SCROLL-DRIVEN EXPERIENCE: DYNAMIC FRAMES SEQUENCE */}
      {/* ========================================================= */}
      <CinematicScrollCanvas />

      {/* ========================================================= */}
      {/* SECTION 2: FARM-GATE DIRECT (Clean Glassmorphic Section)  */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-14 border border-emerald-800/50 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full mb-4 border border-emerald-500/30">
              <span>🌾 Farm-Gate Direct Marketplace</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Fresh from the Farm. <br />
              <span className="text-emerald-400">Fair Value for Every Harvest.</span>
            </h2>

            <p className="text-slate-300 mt-4 text-base sm:text-lg max-w-2xl leading-relaxed">
              Empowering farmers and Farmer Producer Organizations (FPOs) across Andhra Pradesh, Telangana, Maharashtra, Punjab, and Kerala to digitize and trade directly with guaranteed prompt electronic payment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800">
                <CheckCircle className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Direct Farm Listings</h4>
                <p className="text-xs text-slate-400 mt-1">List lot quantities, farm-gate rates, and harvest dates directly.</p>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800">
                <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm text-white">AI Price Defense</h4>
                <p className="text-xs text-slate-400 mt-1">Real-time mandi forecasts prevent distress selling during gluts.</p>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Zero Hidden Cuts</h4>
                <p className="text-xs text-slate-400 mt-1">Direct wallet settlements without unofficial dalal commissions.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register?role=farmer"
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 transition-all"
              >
                Sell Your Harvest Directly
              </Link>
              <Link
                to="/farmers"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/20 transition-all flex items-center space-x-2"
              >
                <span>Explore Certified FPOs</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: FULL PRODUCE CATALOG (50+ COMMODITIES)        */}
      {/* ========================================================= */}
      <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
              <Package className="w-3.5 h-3.5 text-emerald-700" />
              <span>Full Agricultural Catalog • Verified High-Resolution Photography</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Verified Agricultural Produce & Commodities
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Every single produce listing includes photorealistic photography, certified farm origins, quality grading, verified stock quantities, and instant transparent pricing.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Active Listings:</span>
            <span className="text-xs font-black px-3 py-1 bg-emerald-700 text-white rounded-full shadow-sm">
              {displayedProducts.length} Items
            </span>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Categories:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat.value
                  ? 'bg-emerald-700 text-white shadow-emerald-700/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {displayedProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-500 font-medium">No products found in this category.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              Show All Commodities
            </button>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: VERIFIED MERCHANT NETWORK                      */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full mb-4 border border-emerald-500/30">
              <span>🏪 Verified Merchant & Mandi Network</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Source Directly. <br />
              <span className="text-emerald-400">Sell Smarter with AI.</span>
            </h2>

            <p className="text-slate-300 mt-4 text-base sm:text-lg max-w-2xl leading-relaxed">
              Mandi commission agents, regional distributors, and registered grocery sellers can source verified bulk lots directly from accredited farmers without multi-tier broker markups.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <Store className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Aggregated Farmer Inventory</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Procure bulk lots verified with harvest dates, APMC laboratory reports, and moisture certificates.
                </p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Dynamic Pricing Engine</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Automated wholesale and retail margin guidance based on live regional supply and mandi indices.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register?role=seller"
                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/60 transition-all"
              >
                Register as Merchant / Seller
              </Link>
              <Link
                to="/sellers"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/20 transition-all flex items-center space-x-2"
              >
                <span>Seller Network Directory</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: BUYERS & CONSUMERS                             */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 border border-amber-200/60 rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Procurement & Consumer Experience
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Built for Household Shoppers & Institutional Bulk Buyers
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Whether ordering 5 kg of farm-fresh vine tomatoes for your kitchen or 5,000 kg for a food processing facility, AgriTrade Hub provides verified transparent pricing and traceable farm origins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-3">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Product Discovery</h4>
              <p className="text-xs text-slate-500 mt-1">
                Filter by harvest date, organic certification, APMC location, and quality grade.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-3">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Price Comparison</h4>
              <p className="text-xs text-slate-500 mt-1">
                Compare direct farm-gate rates against local APMC wholesale indices in real time.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-3">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Bulk Sourcing Portal</h4>
              <p className="text-xs text-slate-500 mt-1">
                Post custom volume requirements (e.g. 5,000 kg) with your target ceiling price.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-3">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-900">End-to-End Tracking</h4>
              <p className="text-xs text-slate-500 mt-1">
                Track temperature-controlled dispatch and receive automated confirmation receipts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: AGRI AI INTELLIGENCE                           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AGRI AI INTELLIGENCE</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Real-Time Demand Forecast & Price Guidance
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Grounded mathematical models trained on seasonality, regional rainfall, transport cost, and consumption trends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.demandStatus}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    {item.trendPercentage}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{item.commodity}</h3>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Marketplace Rate:</span>
                    <strong className="text-slate-900">₹{item.currentPrice}/kg</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>AI Recommended:</span>
                    <strong className="text-emerald-700">{item.recommendedRange}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Mandi Benchmark:</span>
                    <span>₹{item.mandiBenchmark}/kg</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800 bg-emerald-50/60 p-2 rounded-lg">
                💡 {item.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: COLD-CHAIN FREIGHT & LOGISTICS                 */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden mb-10">
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full mb-4 border border-emerald-500/30">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Cold-Chain & Agrilogistics</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Integrated Multimodal Freight. <br />
              <span className="text-amber-400">Zero Spoilage from Farm to Hub.</span>
            </h2>

            <p className="text-slate-300 mt-4 text-base sm:text-lg max-w-2xl leading-relaxed">
              Dynamic route optimization with live reefer temperature telemetry, toll cost calculator, and multi-stop farmer aggregation corridors.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-emerald-400">0.0%</div>
                <div className="text-xs text-slate-400 mt-0.5">Transit Spoilage Rate</div>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-emerald-400">4°C - 8°C</div>
                <div className="text-xs text-slate-400 mt-0.5">Continuous Cold Chain</div>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-amber-400">₹45 / km</div>
                <div className="text-xs text-slate-400 mt-0.5">Standard Reefer Rate</div>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-white">Live GPS</div>
                <div className="text-xs text-slate-400 mt-0.5">Continuous Telemetry</div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Stop Leaflet Route Calculator */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Interactive Multi-Stop Dispatch & Freight Calculator
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Simulate freight transit from farm collection points to regional mandis and buyer delivery hubs.
          </p>
        </div>
        <RouteMap />
      </section>
    </div>
  );
};
