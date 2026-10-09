import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Truck,
  Navigation,
  Clock,
  Banknote,
  ShieldCheck,
  Thermometer,
  Zap,
  ArrowLeftRight,
  MapPin,
  CheckCircle2,
  Sparkles,
  Layers,
  Fuel,
  TrendingDown,
  RefreshCw,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../../services/api';

// Create custom SVG Leaflet Marker Icons
const createCustomIcon = (bgColor: string, text: string, iconHtml: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${bgColor};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        border: 2.5px solid white;
        font-weight: bold;
        font-size: 13px;
        cursor: pointer;
        position: relative;
        transition: transform 0.2s ease;
      ">
        ${iconHtml}
        <div style="
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid ${bgColor};
        "></div>
      </div>
    `,
    iconSize: [32, 36],
    iconAnchor: [16, 36],
    popupAnchor: [0, -36],
  });
};

const originIcon = createCustomIcon('#059669', 'A', '🌾');
const destIcon = createCustomIcon('#dc2626', 'B', '🏛️');
const checkpointIcon = createCustomIcon('#2563eb', 'C', '❄️');

// Helper to auto-fit map bounds dynamically
function MapAutoBounds({
  coords,
  zoomTrigger,
}: {
  coords: [number, number][];
  zoomTrigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.length > 0) {
      try {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 12,
          animate: true,
          duration: 1.0,
        });
      } catch (err) {
        console.warn('Map fitBounds error:', err);
      }
    }
  }, [map, coords, zoomTrigger]);

  return null;
}

const MANDI_HUBS = [
  { id: 'kurnool', name: 'Kurnool Agricultural Yard (AP)', state: 'Andhra Pradesh' },
  { id: 'guntur', name: 'Guntur Spice & Chilli Yard (AP)', state: 'Andhra Pradesh' },
  { id: 'vijayawada', name: 'Vijayawada Commercial Terminal (AP)', state: 'Andhra Pradesh' },
  { id: 'hyderabad', name: 'Hyderabad Bowenpally Wholesale (TG)', state: 'Telangana' },
  { id: 'warangal', name: 'Warangal Enmamula Grain Market (TG)', state: 'Telangana' },
  { id: 'bangalore', name: 'Bangalore Yeshwanthpur APMC (KA)', state: 'Karnataka' },
  { id: 'pune', name: 'Pune Gultekdi Market Yard (MH)', state: 'Maharashtra' },
  { id: 'mumbai', name: 'Mumbai Vashi APMC Terminal (MH)', state: 'Maharashtra' },
  { id: 'nagpur', name: 'Nagpur Kalamna Citrus Mandi (MH)', state: 'Maharashtra' },
  { id: 'nashik', name: 'Nashik Lasalgaon Onion Mandi (MH)', state: 'Maharashtra' },
  { id: 'delhi', name: 'Azadpur Mandi Delhi NCR (DL)', state: 'Delhi NCR' },
  { id: 'jaipur', name: 'Jaipur Muhana Mandi (RJ)', state: 'Rajasthan' },
  { id: 'ahmedabad', name: 'Ahmedabad Jamalpur APMC (GJ)', state: 'Gujarat' },
  { id: 'chennai', name: 'Chennai Koyambedu Wholesale (TN)', state: 'Tamil Nadu' },
  { id: 'kolkata', name: 'Kolkata Posta Wholesale Mandi (WB)', state: 'West Bengal' },
  { id: 'indore', name: 'Indore Choithram Mandi (MP)', state: 'Madhya Pradesh' },
];

export const RouteMap: React.FC = () => {
  const [pickup, setPickup] = useState('kurnool');
  const [drop, setDrop] = useState('delhi');
  const [weightKg, setWeightKg] = useState(2500);
  const [vehicleType, setVehicleType] = useState('reefer');
  const [logisticsData, setLogisticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [zoomTrigger, setZoomTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'itinerary' | 'savings'>('overview');
  const [optimizationBanner, setOptimizationBanner] = useState(true);

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/logistics/estimate', {
        method: 'POST',
        body: JSON.stringify({
          pickup,
          drop,
          weightKg,
          vehicleType,
          optimizationMode: 'express',
        }),
      });

      if (data && data.success) {
        setLogisticsData(data);
        setZoomTrigger((prev) => prev + 1);
        setOptimizationBanner(true);
      }
    } catch (e) {
      console.warn('Logistics route estimation error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRoute();
  }, [pickup, drop, vehicleType]);

  // Swap Origin and Destination
  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(drop);
    setDrop(temp);
  };

  // Extract polyline coordinates
  const polylinePositions: [number, number][] = useMemo(() => {
    if (logisticsData?.polyline && logisticsData.polyline.length > 0) {
      return logisticsData.polyline;
    }
    if (logisticsData?.waypoints && logisticsData.waypoints.length > 1) {
      return logisticsData.waypoints.map((w: any) => [w.lat, w.lng]);
    }
    return [
      [15.8281, 78.0373], // Kurnool
      [28.7159, 77.1789], // Delhi
    ];
  }, [logisticsData]);

  // Center on Route handler
  const handleFitRoute = () => {
    setZoomTrigger((prev) => prev + 1);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl space-y-0">
      {/* Top Banner & Controls */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-850 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold mb-2">
              <Truck className="w-3.5 h-3.5" />
              <span>Smart Agricultural Cold-Chain & Freight Engine</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>Farm-to-Mandi Route & Logistics Optimizer</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Real-time route calculation, transit duration, reefer temperature control, and automated freight estimates.
            </p>
          </div>

          {/* Quick Metrics */}
          {logisticsData && (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 bg-slate-800/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-700/80 shadow-inner">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Distance</div>
                <div className="text-base sm:text-lg font-black text-white mt-0.5">
                  {logisticsData.distanceKm} km
                </div>
              </div>
              <div className="text-center border-x border-slate-700 px-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ETA</div>
                <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
                  {logisticsData.etaHours} hrs
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Freight Est.</div>
                <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
                  ₹{logisticsData.estimatedCost?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mt-6 pt-6 border-t border-slate-800">
          {/* Origin */}
          <div className="lg:col-span-4 space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Origin (Farm / Mandi)
            </label>
            <div className="relative">
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-slate-800 text-white px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 focus:outline-none focus:border-emerald-500 transition-all appearance-none pr-8 cursor-pointer"
              >
                {MANDI_HUBS.map((hub) => (
                  <option key={hub.id} value={hub.id} className="bg-slate-900 text-white">
                    {hub.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Swap Button (1 col) */}
          <div className="lg:col-span-1 flex items-end justify-center pb-0.5">
            <button
              type="button"
              onClick={handleSwapLocations}
              title="Reverse Origin & Destination"
              className="w-full sm:w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="lg:col-span-4 space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Destination (Market Hub)
            </label>
            <div className="relative">
              <select
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                className="w-full bg-slate-800 text-white px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 focus:outline-none focus:border-emerald-500 transition-all appearance-none pr-8 cursor-pointer"
              >
                {MANDI_HUBS.map((hub) => (
                  <option key={hub.id} value={hub.id} className="bg-slate-900 text-white">
                    {hub.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="lg:col-span-3 space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Vehicle Type & Cooling
            </label>
            <div className="relative">
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-slate-800 text-white px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 focus:outline-none focus:border-emerald-500 transition-all appearance-none pr-8 cursor-pointer"
              >
                <option value="reefer">Cold-Chain Reefer (+2°C to +8°C)</option>
                <option value="standard">Eicher Pro (3.5T Medium Commercial)</option>
                <option value="mini">Tata Ace Gold (1T Light Freight)</option>
                <option value="heavy">BharatBenz 1617R (10T Heavy Freight)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Optimize Transit Route Action Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Corridor Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 w-full sm:w-auto">
            <span className="font-bold text-slate-400 text-[10px] uppercase">Corridors:</span>
            <button
              onClick={() => {
                setPickup('kurnool');
                setDrop('delhi');
                setVehicleType('reefer');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold transition-all border border-slate-700/60"
            >
              Kurnool ➔ Delhi (NH-44 Reefer)
            </button>
            <button
              onClick={() => {
                setPickup('guntur');
                setDrop('hyderabad');
                setVehicleType('standard');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold transition-all border border-slate-700/60"
            >
              Guntur ➔ Hyderabad
            </button>
            <button
              onClick={() => {
                setPickup('nagpur');
                setDrop('delhi');
                setVehicleType('reefer');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold transition-all border border-slate-700/60"
            >
              Nagpur ➔ Delhi
            </button>
          </div>

          {/* Big Action Button */}
          <button
            onClick={calculateRoute}
            disabled={loading}
            className="w-full sm:w-auto min-w-[220px] bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black text-xs py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-emerald-600/30"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Recalculating Transit...' : 'Optimize Transit Route'}</span>
          </button>
        </div>
      </div>

      {/* Optimization Gain Banner */}
      {optimizationBanner && logisticsData && (
        <div className="bg-emerald-50 border-b border-emerald-200/80 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-emerald-900">
                Route & Logistics Optimization Active:{' '}
              </span>
              <span className="text-emerald-800 font-medium">
                {logisticsData.corridorName || 'National Express Highway Corridor'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-bold text-emerald-900">
            <span className="inline-flex items-center space-x-1 bg-emerald-100/90 px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3 text-emerald-700" />
              <span>Saved ~{logisticsData.savings?.distanceSavedKm || 45} km</span>
            </span>
            <span className="inline-flex items-center space-x-1 bg-emerald-100/90 px-2 py-0.5 rounded-full">
              <Banknote className="w-3 h-3 text-emerald-700" />
              <span>Saved ₹{logisticsData.savings?.costSavedInr || 2400}</span>
            </span>
            <button
              onClick={() => setOptimizationBanner(false)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Leaflet Map Box */}
      <div className="h-[460px] w-full relative bg-slate-100">
        <MapContainer
          center={[16.8883, 79.46]}
          zoom={6}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          {/* Dynamic bounds fitting */}
          <MapAutoBounds coords={polylinePositions} zoomTrigger={zoomTrigger} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Polyline: Outer Glow for Highway look */}
          {polylinePositions.length > 1 && (
            <Polyline
              positions={polylinePositions}
              color="#047857"
              weight={7}
              opacity={0.35}
            />
          )}

          {/* Polyline: Real Road Solid Core */}
          {polylinePositions.length > 1 && (
            <Polyline
              positions={polylinePositions}
              color="#059669"
              weight={4}
              opacity={0.95}
            />
          )}

          {/* Polyline: Motion Highway Dashed line */}
          {polylinePositions.length > 1 && (
            <Polyline
              positions={polylinePositions}
              color="#ffffff"
              weight={2}
              opacity={0.8}
              dashArray="8, 12"
            />
          )}

          {/* Intermediate Waypoints & Checkpoints */}
          {logisticsData?.waypoints?.map((wp: any, idx: number) => {
            const isOrigin = wp.role === 'pickup';
            const isDest = wp.role === 'delivery';
            const icon = isOrigin ? originIcon : isDest ? destIcon : checkpointIcon;

            return (
              <Marker key={idx} position={[wp.lat, wp.lng]} icon={icon}>
                <Popup>
                  <div className="p-1 max-w-xs space-y-1.5 text-xs">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-extrabold text-slate-900">{wp.shortName || wp.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          isOrigin
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDest
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {wp.status || 'Active'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">{wp.type}</div>
                    {wp.details && <div className="text-[10px] text-slate-500">{wp.details}</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Top-Right Map Controls */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
          <button
            onClick={handleFitRoute}
            title="Auto-Fit & Center Transit Route"
            className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl text-slate-700 hover:text-emerald-700 hover:bg-white transition-all flex items-center space-x-1 text-xs font-bold active:scale-95"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Fit Route</span>
          </button>
        </div>

        {/* Floating Bottom Route Card */}
        {logisticsData && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200/90 shadow-2xl max-w-md">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Assigned Fleet: {logisticsData.vehicleName}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                GPS LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400">Target Temp:</span>
                <span className="font-bold text-slate-800 ml-1">
                  {logisticsData.reeferTelemetry?.targetTemp || '+4.0°C'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Fastag Tolls:</span>
                <span className="font-bold text-slate-800 ml-1">
                  {logisticsData.operationalMetrics?.tollPlazasCount || 6} Plazas (₹
                  {logisticsData.costBreakdown?.tollEstimate || 1800})
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 mt-1.5 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Routing via National Agricultural Corridors with active e-Way bill & phytosanitary clearance.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Detailed Tabs / Analytics */}
      {logisticsData && (
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          {/* Tab Selector */}
          <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-2xl w-fit text-xs font-bold">
            {[
              { id: 'overview', label: 'Route Breakdown', icon: Layers },
              { id: 'telemetry', label: 'Reefer Cold-Chain', icon: Thermometer },
              { id: 'itinerary', label: 'Transit Milestones', icon: MapPin },
              { id: 'savings', label: 'Backhaul & Cost Optimization', icon: TrendingDown },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Route Breakdown */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Base Freight</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  ₹{logisticsData.costBreakdown?.baseFreight?.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Per commercial distance rates</div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Fastag Tolls</span>
                <div className="text-base font-extrabold text-amber-700 mt-0.5">
                  ₹{logisticsData.costBreakdown?.tollEstimate?.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Across {logisticsData.operationalMetrics?.tollPlazasCount} NHAI gates
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Fuel Usage</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  {logisticsData.operationalMetrics?.fuelLitres} L Diesel
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Commercial highway consumption</div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Carbon Emission</span>
                <div className="text-base font-extrabold text-emerald-800 mt-0.5">
                  {logisticsData.operationalMetrics?.carbonKg} kg CO₂
                </div>
                <div className="text-[10px] text-emerald-600 mt-1">Optimized Green Freight Route</div>
              </div>
            </div>
          )}

          {/* Tab 2: Reefer Cold-Chain */}
          {activeTab === 'telemetry' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Core Temperature</span>
                <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                  {logisticsData.reeferTelemetry?.sensorTemp}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Target: {logisticsData.reeferTelemetry?.targetTemp}
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Humidity Hold</span>
                <div className="text-base font-extrabold text-blue-700 mt-0.5">
                  {logisticsData.reeferTelemetry?.humidity}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Controlled horticulture chamber</div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Compressor Pulse</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  {logisticsData.reeferTelemetry?.compressorStatus}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {logisticsData.reeferTelemetry?.defrostCycle}
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Freshness Score</span>
                <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                  {logisticsData.reeferTelemetry?.qualityRetention}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Zero spoilage guarantee</div>
              </div>
            </div>
          )}

          {/* Tab 3: Itinerary Milestones */}
          {activeTab === 'itinerary' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 text-xs">
                Transit Milestones & Clearance Nodes
              </h4>
              <div className="space-y-2">
                {logisticsData.waypoints?.map((wp: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        wp.role === 'pickup'
                          ? 'bg-emerald-100 text-emerald-800'
                          : wp.role === 'delivery'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{wp.name}</span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                          {wp.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{wp.type}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{wp.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Backhaul & Cost Optimization */}
          {activeTab === 'savings' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-emerald-800 font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Return Backhaul Load Matching Engine</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                By booking return-trip dry goods and grains from {logisticsData.destination?.name}, return empty-haul
                deadhead distance is eliminated, lowering round-trip logistics expenditure.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Return Load Availability</span>
                  <div className="font-black text-sm text-emerald-950 mt-0.5">
                    {logisticsData.backhaulMatch?.probability}
                  </div>
                  <div className="text-[10px] text-emerald-800 mt-1">
                    {logisticsData.backhaulMatch?.recommendedLoad}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Round-Trip Efficiency Benefit</span>
                  <div className="font-black text-sm text-slate-900 mt-0.5">
                    {logisticsData.backhaulMatch?.estimatedReturnSavings}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Automated matching with institutional buyers in destination mandi
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
