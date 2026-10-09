import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ShieldCheck,
  TrendingUp,
  Truck,
  ArrowRight,
  Search,
  MapPin,
  Star,
  Building2,
  CheckCircle2,
  Phone,
  Mail,
  Snowflake,
  Filter,
  PackageCheck
} from 'lucide-react';
import { fallbackSellers, SellerProfile } from '../../data/fallbackSellers';

export const SellersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColdStorage, setFilterColdStorage] = useState(false);
  const [selectedState, setSelectedState] = useState('all');

  const statesList = useMemo(() => {
    const set = new Set(fallbackSellers.map((s) => s.state));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredSellers = useMemo(() => {
    return fallbackSellers.filter((seller) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        seller.name.toLowerCase().includes(q) ||
        seller.city.toLowerCase().includes(q) ||
        seller.state.toLowerCase().includes(q) ||
        seller.specialtyCommodities.some((c) => c.toLowerCase().includes(q));

      const matchesCold = !filterColdStorage || seller.coldStorageAvailable;
      const matchesState = selectedState === 'all' || seller.state === selectedState;

      return matchesSearch && matchesCold && matchesState;
    });
  }, [searchQuery, filterColdStorage, selectedState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
          <Store className="w-3.5 h-3.5 text-emerald-700" />
          <span>Accredited Wholesale Merchant Directory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Verified Mandi Merchants & Aggregators
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Connect directly with licensed APMC commission agents, processing millers, and FPO aggregation hubs supplying verified farm lots with cold-chain guarantees.
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{fallbackSellers.length}+</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Verified Wholesale Merchants</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">2,10,000+</div>
          <div className="text-xs font-medium text-slate-500 mt-1">MT Traded Annually</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-blue-700">100%</div>
          <div className="text-xs font-medium text-slate-500 mt-1">APMC Licensed & Bonded</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-amber-600">8 States</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Cold-Chain Network</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by merchant, city, state, or crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* State selector */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:outline-none"
            >
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st === 'all' ? 'All States' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Cold storage toggle */}
          <button
            onClick={() => setFilterColdStorage(!filterColdStorage)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              filterColdStorage
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Cold Storage Hubs Only</span>
          </button>
        </div>
      </div>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSellers.map((seller) => (
          <div
            key={seller._id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Card Banner */}
              <div className="relative h-28 bg-slate-100 overflow-hidden">
                <img
                  src={seller.bannerImage}
                  alt={seller.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-extrabold rounded-full shadow-sm flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-200" />
                    <span>APMC Verified</span>
                  </span>
                </div>
              </div>

              {/* Profile Header */}
              <div className="p-5 pt-0 relative space-y-3">
                <div className="flex items-end justify-between -mt-8 mb-2">
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-16 h-16 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
                  />
                  <div className="flex items-center space-x-1 text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-extrabold text-slate-900">{seller.rating}</span>
                    <span className="text-slate-400">({seller.reviewsCount})</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                    {seller.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{seller.city}, {seller.state}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    Lic: {seller.apmcLicense}
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {seller.description}
                </p>

                {/* Logistics & Storage Specs */}
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs border border-slate-100">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Annual Volume:</span>
                    <strong>{seller.annualVolume}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Capacity:</span>
                    <strong className="truncate">{seller.storageCapacity}</strong>
                  </div>
                  {seller.coldStorageAvailable && (
                    <div className="flex items-center space-x-1 text-blue-700 font-semibold text-[11px]">
                      <Snowflake className="w-3 h-3" />
                      <span>Temperature Controlled Pre-Cooling Available</span>
                    </div>
                  )}
                </div>

                {/* Commodities Badges */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Core Commodities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {seller.specialtyCommodities.map((comm, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded-md border border-emerald-100"
                      >
                        {comm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
              <a
                href={`tel:${seller.phone}`}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Desk</span>
              </a>

              <Link
                to={`/marketplace?search=${encodeURIComponent(seller.city)}`}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <span>Browse {seller.activeListingsCount} Lots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredSellers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Store className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No merchants matched your filter</h3>
          <p className="text-xs text-slate-500">Try adjusting your search keyword or clearing the state filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedState('all');
              setFilterColdStorage(false);
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
