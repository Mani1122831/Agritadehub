import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-3">
          <span>⚙️ Platform Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          How AgriTrade Hub AI Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          From farm harvest to consumer table — a digital ecosystem uniting commerce, multimodal AI, and cold-chain agrilogistics.
        </p>
      </div>

      {/* 4 Steps Graphic Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
          <div className="text-4xl">🧑‍🌾</div>
          <span className="text-xs font-bold text-emerald-700 uppercase">Step 1: Listing</span>
          <h3 className="text-base font-bold text-slate-900">Farmer Lists Harvest</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Growers input produce variety, harvested quantity, quality grade, and target price directly from farm gates.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
          <div className="text-4xl">🤖</div>
          <span className="text-xs font-bold text-amber-600 uppercase">Step 2: Intelligence</span>
          <h3 className="text-base font-bold text-slate-900">AI Demand & Matching</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Mathematical models match buyer volume requests and provide fair price range advisories to eliminate panic selling.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
          <div className="text-4xl">🚚</div>
          <span className="text-xs font-bold text-blue-600 uppercase">Step 3: Agrilogistics</span>
          <h3 className="text-base font-bold text-slate-900">Cold Transit Routing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Multi-stop routing optimizes transport vehicle allocation (Tata Ace to Reefer trucks) with live GPS waypoints.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
          <div className="text-4xl">💳</div>
          <span className="text-xs font-bold text-emerald-700 uppercase">Step 4: Settlement</span>
          <h3 className="text-base font-bold text-slate-900">Direct Delivery & Payout</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automated customer receipts and instant host alerts with direct electronic payments deposited to farmer accounts.
          </p>
        </div>
      </div>

      <div className="p-8 sm:p-12 bg-emerald-950 text-white rounded-3xl text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Join the Revolution?</h2>
        <p className="text-xs sm:text-sm text-emerald-200 max-w-xl mx-auto">
          Start sourcing verified produce or list your farm harvest in under 2 minutes.
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg transition-all"
        >
          Create Free Account Today
        </Link>
      </div>
    </div>
  );
};
