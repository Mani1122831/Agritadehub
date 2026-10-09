import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

const FEATURED_FARMERS = [
  {
    name: 'Ramesh Reddy',
    organization: 'Guntur Kisan Producers Cooperative',
    location: 'Guntur, Andhra Pradesh',
    crops: 'Tomatoes, Guntur Teja Chillies, Turmeric',
    experience: '24 years in organic horticulture',
    members: '140 farmer members',
    badge: 'GI-Tag Certified Producer',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Lakshmi Agro FPO',
    organization: 'Lakshmi Farmer Producer Company Ltd',
    location: 'Warangal, Telangana',
    crops: 'Yellow Maize, Basmati Rice, Cotton Bolls',
    experience: 'State-certified collective',
    members: '450 shareholder farmers',
    badge: 'NABARD Recognized FPO',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Balasaheb Patil',
    organization: 'Nasik Onion Cultivators Group',
    location: 'Nashik, Maharashtra',
    crops: 'Red Onions, Jyoti Potatoes, Table Grapes',
    experience: 'Cured sun-drying cold ventilation',
    members: '85 grower members',
    badge: 'Export Grade Certified',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Jaintia Organic Hills FPO',
    organization: 'Meghalaya Spice Growers Collective',
    location: 'Shillong, Meghalaya',
    crops: 'Lakadong High-Curcumin Turmeric, Ginger',
    experience: 'Certified 7.5%+ natural curcumin yield',
    members: '220 hill growers',
    badge: '100% Organic Certified',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  },
];

export const FarmersPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-3">
          <span>🧑‍🌾 Empowering Grassroots Agriculture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Verified Farmers & FPO Producers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Direct trade connections with verified grassroots growers, Farmer Producer Companies, and organic collectives across India. No middleman deductions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {FEATURED_FARMERS.map((farmer, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col sm:flex-row"
          >
            <div className="sm:w-2/5 aspect-video sm:aspect-auto bg-slate-100 relative">
              <img src={farmer.image} alt={farmer.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {farmer.badge}
              </div>
            </div>

            <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{farmer.name}</h3>
                <div className="text-xs text-emerald-700 font-semibold">{farmer.organization}</div>
                <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{farmer.location}</span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div>
                    <strong>Crops:</strong> {farmer.crops}
                  </div>
                  <div>
                    <strong>Scale:</strong> {farmer.members}
                  </div>
                </div>
              </div>

              <Link
                to={`/marketplace?search=${encodeURIComponent(farmer.name)}`}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-700 hover:text-white text-emerald-800 rounded-xl text-xs font-bold transition-all text-center"
              >
                View Available Harvest Batches &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Are You a Farmer or FPO Leader?</h2>
        <p className="text-xs sm:text-sm text-emerald-200 max-w-xl mx-auto">
          List your harvest produce, receive guaranteed electronic bank payments, and protect your margins with AI price intelligence.
        </p>
        <Link
          to="/register?role=farmer"
          className="inline-block px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg transition-all"
        >
          Register as Farmer / FPO Producer
        </Link>
      </div>
    </div>
  );
};
