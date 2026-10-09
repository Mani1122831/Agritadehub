import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Truck, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Direct Farm Sourcing</h4>
              <p className="text-xs text-slate-400 mt-1">Verified farmers and FPOs with farm-gate batch certificates.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Grounded AI Engine</h4>
              <p className="text-xs text-slate-400 mt-1">Real-time demand forecasting and smart matching with zero hallucination.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Optimized Agrilogistics</h4>
              <p className="text-xs text-slate-400 mt-1">Multi-modal reefer routing and freight estimation from mandi to consumer.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Transparent Settlements</h4>
              <p className="text-xs text-slate-400 mt-1">Idempotent transactions, verified receipts, and direct bank payouts.</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌾</span>
              <span className="text-xl font-extrabold text-white tracking-tight">
                AGRITRADE<span className="text-emerald-500">HUB</span> AI
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold tracking-wider mt-1 uppercase">
              Smart India Hackathon 2026 • SIH26033
            </p>
            <p className="text-sm text-slate-400 mt-3 max-w-sm leading-relaxed">
              Empowering farmers, FPOs, wholesale merchants, bulk institutions, and retail households through unified digital commerce, real-time logistics, and multimodal AI intelligence.
            </p>
            <div className="mt-4 flex items-center space-x-3 text-xs text-slate-400">
              <span className="inline-flex items-center text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
                Live Mandi Exchange Active
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Marketplace</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/marketplace?category=Vegetables" className="hover:text-emerald-400 transition-colors">Vegetables & Roots</Link></li>
              <li><Link to="/marketplace?category=Fruits" className="hover:text-emerald-400 transition-colors">Seasonal Fruits</Link></li>
              <li><Link to="/marketplace?category=Grains" className="hover:text-emerald-400 transition-colors">Wheat & Rice Grains</Link></li>
              <li><Link to="/marketplace?category=Pulses" className="hover:text-emerald-400 transition-colors">Pulses & Dals</Link></li>
              <li><Link to="/marketplace?category=Spices" className="hover:text-emerald-400 transition-colors">Spices & Turmeric</Link></li>
              <li><Link to="/marketplace?category=Organic+Products" className="hover:text-emerald-400 transition-colors">Certified Organic</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Ecosystem</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/farmers" className="hover:text-emerald-400 transition-colors">Farmers & FPOs Portal</Link></li>
              <li><Link to="/sellers" className="hover:text-emerald-400 transition-colors">Merchant Sourcing Hub</Link></li>
              <li><Link to="/bulk-buyers" className="hover:text-emerald-400 transition-colors">Bulk Procurement & Matching</Link></li>
              <li><Link to="/logistics" className="hover:text-emerald-400 transition-colors">Smart Route Logistics</Link></li>
              <li><Link to="/voice-agent" className="hover:text-emerald-400 transition-colors">Gemini Voice Assistant</Link></li>
              <li><Link to="/ai" className="hover:text-emerald-400 transition-colors">AI Demand Intelligence</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">Platform Workflow</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-emerald-400 transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h5>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Balanagar Agricultural Complex, Hyderabad, Telangana</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+91 98480 11223 (Toll Free)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>kasanimanikanta2005@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between">
          <p>&copy; {new Date().getFullYear()} AgriTrade Hub AI. All rights reserved. Developed for Smart India Hackathon 2026 (SIH26033).</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="text-slate-400">Security: TLS 1.3 / Bcrypt / JWT</span>
            <span className="text-slate-400">Logistics: Multi-Stop Routing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
