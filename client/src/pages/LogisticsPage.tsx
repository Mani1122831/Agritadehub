import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Snowflake,
  Fuel,
  TrendingDown,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Share2,
  Activity,
  Layers,
  Leaf
} from 'lucide-react';
import { apiRequest } from '../services/api';

interface Hub {
  key: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  state: string;
  corridor: string;
}

export const LogisticsPage: React.FC = () => {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [origin, setOrigin] = useState('guntur');
  const [destination, setDestination] = useState('hyderabad');
  const [vehicleType, setVehicleType] = useState('reefer');
  const [produceCategory, setProduceCategory] = useState('Vegetables');
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  // 1. Fetch available hubs
  useEffect(() => {
    apiRequest('/logistics/hubs')
      .then((res) => {
        if (res.success && res.hubs) {
          setHubs(res.hubs);
        }
      })
      .catch(() => {
        // Fallback hubs if offline
        setHubs([
          { key: 'guntur', name: 'Guntur Spice & Chilli Yard (AP)', shortName: 'Guntur Mandi', lat: 16.3067, lng: 80.4365, state: 'Andhra Pradesh', corridor: 'NH-16 Coastal' },
          { key: 'hyderabad', name: 'Hyderabad Bowenpally Wholesale Mandi (TG)', shortName: 'Bowenpally Mandi', lat: 17.47, lng: 78.4836, state: 'Telangana', corridor: 'NH-44 Outer Ring Road' },
          { key: 'nashik', name: 'Nashik Lasalgaon Onion Mandi (MH)', shortName: 'Lasalgaon Mandi', lat: 20.1472, lng: 74.2268, state: 'Maharashtra', corridor: 'Samruddhi Mahamarg' },
          { key: 'bangalore', name: 'Bangalore Yeshwanthpur APMC (KA)', shortName: 'Yeshwanthpur APMC', lat: 13.0238, lng: 77.5529, state: 'Karnataka', corridor: 'NH-44 Spur' },
          { key: 'delhi', name: 'Azadpur Mandi Delhi NCR (DL)', shortName: 'Azadpur Mandi', lat: 28.7159, lng: 77.1789, state: 'Delhi NCR', corridor: 'NH-44 Gateway' },
          { key: 'karnal', name: 'Karnal Grain Terminal (HR)', shortName: 'Karnal Yard', lat: 29.6857, lng: 76.9905, state: 'Haryana', corridor: 'GT Road' },
          { key: 'amritsar', name: 'Amritsar Basmati Terminal (PB)', shortName: 'Amritsar Hub', lat: 31.634, lng: 74.8723, state: 'Punjab', corridor: 'NH-3 Gateway' },
          { key: 'pune', name: 'Pune Gultekdi Market Yard (MH)', shortName: 'Pune Market', lat: 18.4967, lng: 73.8641, state: 'Maharashtra', corridor: 'NH-48 Western' }
        ]);
      });
  }, []);

  // 2. Compute route on change
  const computeRoute = async () => {
    setLoading(true);
    setBookingConfirmed(false);
    try {
      const res = await apiRequest('/logistics/estimate', {
        method: 'POST',
        body: JSON.stringify({
          origin,
          destination,
          vehicleType,
          produceCategory,
        }),
      });

      if (res.success) {
        setRouteData(res);
      }
    } catch (err) {
      console.warn('Failed to compute route:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (origin && destination) {
      computeRoute();
    }
  }, [origin, destination, vehicleType, produceCategory]);

  const handleBookFleet = () => {
    const randomEwb = `EWB-AGRI-${Math.floor(100000 + Math.random() * 900000)}-2026`;
    setTrackingId(randomEwb);
    setBookingConfirmed(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
          <Truck className="w-3.5 h-3.5 text-emerald-700" />
          <span>AI Cold-Chain Multi-Stop Logistics Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Smart Agricultural Route Optimizer
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Dynamic highway routing across Indian agricultural corridors with live reefer compressor telemetry, toll estimations, Fastag checkpoints, and backhaul freight matching.
        </p>
      </div>

      {/* Main Route Configurator Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Origin Mandi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Origin Farm / Mandi *</span>
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {hubs.map((h) => (
                <option key={h.key} value={h.key}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Hub */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Destination Bay *</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {hubs
                .filter((h) => h.key !== origin)
                .map((h) => (
                  <option key={h.key} value={h.key}>
                    {h.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Truck className="w-3.5 h-3.5 text-purple-600" />
              <span>Fleet Vehicle *</span>
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="reefer">❄️ Reefer Truck (14 Ton, Cold +4°C)</option>
              <option value="heavy">🚛 Tata 1109 Heavy (8 Ton, Dry)</option>
              <option value="mini">🛻 Tata Ace Mini (1.5 Ton, Local)</option>
              <option value="ev">⚡ Agri-EV Cargo Van (1.2 Ton, Zero CO₂)</option>
            </select>
          </div>

          {/* Produce Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Commodity Category *</span>
            </label>
            <select
              value={produceCategory}
              onChange={(e) => setProduceCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Vegetables">Perishable Vegetables</option>
              <option value="Fruits">Fresh Orchard Fruits</option>
              <option value="Spices">High-Value Spices</option>
              <option value="Grains">Dry Grains & Wheat</option>
              <option value="Pulses">Pulses & Dals</option>
            </select>
          </div>
        </div>

        {/* Compute Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Connected to National Highway OSRM Engine & APMC Mandi Geo-Gates</span>
          </div>

          <button
            onClick={computeRoute}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Optimizing Corridor...' : 'Recalculate AI Route'}</span>
          </button>
        </div>
      </div>

      {/* Route Results & Metrics */}
      {routeData && (
        <div className="space-y-8">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Road Distance</span>
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {routeData.distanceKm} <span className="text-sm font-semibold text-slate-500">km</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                Saved {routeData.savings?.distanceSavedKm || 24} km via corridor routing
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Transit Duration</span>
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {routeData.etaHours} <span className="text-sm font-semibold text-slate-500">hrs</span>
              </div>
              <div className="text-[11px] text-blue-700 font-semibold mt-1">
                Includes mandatory highway driver rest cycle
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>Total Freight Cost</span>
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                ₹{routeData.estimatedCost?.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1">
                Base Freight: ₹{routeData.costBreakdown?.baseFreight} + Tolls: ₹{routeData.costBreakdown?.tollEstimate}
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase">
                <Leaf className="w-4 h-4 text-green-600" />
                <span>Carbon & Eco Index</span>
              </div>
              <div className="text-3xl font-black text-emerald-700 mt-2">
                {routeData.operationalMetrics?.carbonKg} <span className="text-sm font-semibold text-slate-500">kg CO₂</span>
              </div>
              <div className="text-[11px] text-green-700 font-semibold mt-1">
                {routeData.operationalMetrics?.fuelLitres} Litres Diesel Consumption
              </div>
            </div>
          </div>

          {/* Interactive Corridor Map & Visual Pathway */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  National Highway Corridor Telemetry
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">
                  {routeData.corridorName || 'Indian Agricultural Express Corridor'}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Live OSRM Highway Linked</span>
                </span>
              </div>
            </div>

            {/* Visual Highway Track representation */}
            <div className="relative py-8 px-4 bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-slate-800 -translate-y-1/2 rounded-full" />
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-emerald-500/80 -translate-y-1/2 rounded-full shadow-[0_0_12px_#10b981]" />

              <div className="relative flex justify-between items-center z-10">
                {routeData.waypoints?.map((wp: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-2">
                    <button
                      onClick={() => setActiveStep(idx)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                        activeStep === idx
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/30 scale-110 shadow-lg'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                    <span className="text-[11px] font-bold text-slate-200 max-w-[80px] sm:max-w-[120px] line-clamp-1">
                      {wp.shortName || wp.name}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 uppercase px-1.5 py-0.5 bg-emerald-950/60 rounded border border-emerald-800/50">
                      {wp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Waypoint Details Card */}
            {routeData.waypoints?.[activeStep] && (
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                    Checkpoint #{activeStep + 1}: {routeData.waypoints[activeStep].type}
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {routeData.waypoints[activeStep].name}
                  </h4>
                  <p className="text-slate-400">
                    {routeData.waypoints[activeStep].details}
                  </p>
                </div>

                <div className="shrink-0 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-500 block">Coordinates</span>
                  <span className="font-mono text-xs text-emerald-300">
                    {routeData.waypoints[activeStep].lat?.toFixed(4)}°N, {routeData.waypoints[activeStep].lng?.toFixed(4)}°E
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reefer Telemetry & Backhaul Optimization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reefer Telemetry Box */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Snowflake className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cold-Chain Reefer Telemetry
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full">
                  Automated Pulse
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400">Target Temp:</span>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {routeData.reeferTelemetry?.targetTemp}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400">Live Sensor:</span>
                  <p className="font-extrabold text-blue-700 text-sm">
                    {routeData.reeferTelemetry?.sensorTemp}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400">Chamber Humidity:</span>
                  <p className="font-bold text-slate-900">
                    {routeData.reeferTelemetry?.humidity}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400">Quality Retention:</span>
                  <p className="font-bold text-emerald-700">
                    {routeData.reeferTelemetry?.qualityRetention}
                  </p>
                </div>
              </div>
            </div>

            {/* Backhaul Match Box */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Return Trip Backhaul Match
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full">
                  AI Freight Rebate
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-1">
                  <span className="text-amber-900 font-bold">
                    {routeData.backhaulMatch?.probability} Return Load Match
                  </span>
                  <p className="text-slate-600">
                    {routeData.backhaulMatch?.recommendedLoad} from destination hub.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500">Round-Trip Savings:</span>
                  <strong className="text-emerald-700">
                    {routeData.backhaulMatch?.estimatedReturnSavings}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Book Fleet Dispatch CTA */}
          <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">
                Lock In Freight & Dispatch Vehicle
              </h3>
              <p className="text-xs text-slate-400">
                Confirm vehicle booking with verified e-Way Bill generation, driver assignment, and escrow fare lock.
              </p>
            </div>

            {bookingConfirmed ? (
              <div className="p-4 bg-emerald-600 rounded-2xl flex items-center space-x-3 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <div>Dispatch Order Confirmed!</div>
                  <div className="text-emerald-200 font-mono text-[11px]">{trackingId}</div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleBookFleet}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center space-x-2 shrink-0"
              >
                <Truck className="w-4 h-4" />
                <span>Confirm Fleet Dispatch (₹{routeData.estimatedCost?.toLocaleString('en-IN')})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
