# AgriTrade Hub AI — SIH 2026 (SIH26033)
> **"From Farm to Market. One Intelligent Platform."**

A complete, production-grade digital agricultural marketplace built for **Smart India Hackathon 2026 (Problem Statement: SIH26033)** connecting **Farmers / FPOs**, **Mandi Merchants / Sellers**, **Household Consumers**, and **Institutional Bulk Buyers** with Grounded AI Intelligence, Real Voice Assistance, Real Email OTP Auth, and Cold-Chain Agrilogistics.

---

## 🌟 Highlights

### 1. 22 Photorealistic Agricultural Produce Items
Every single product listing in the marketplace features individual high-resolution photography, certified farm origins, quality grading, verified stock quantities, and instant transparent pricing:
1. **Fresh Farm Tomatoes** (Guntur, AP) — Grade A, ₹32/kg
2. **Nasik Red Onions** (Nashik, MH) — Grade A, ₹28/kg
3. **Agra Jyoti Potatoes** (Agra, UP) — Grade A, ₹22/kg
4. **Banganapalli Golden Mangoes** (Kurnool, AP) — Export GI, ₹130/kg
5. **Robusta Golden Bananas** (Tiruchirappalli, TN) — Grade A+, ₹45/kg
6. **Aromatic Basmati Rice (1121)** (Amritsar, PB) — Export, ₹95/kg
7. **MP Sharbati Golden Wheat** (Bhopal, MP) — Grade A, ₹42/kg
8. **Guntur Teja Red Chillies** (Guntur, AP) — Export, ₹220/kg
9. **Fresh Pungent Green Chillies** (Kolar, KA) — Grade A, ₹48/kg
10. **Lakadong High-Curcumin Turmeric** (Shillong, ML) — Organic, ₹180/kg
11. **Bold Raw Groundnuts** (Rajkot, GJ) — Grade A, ₹90/kg
12. **Golden Yellow Maize / Corn** (Davangere, KA) — Grade A, ₹24/kg
13. **Shankar-6 Raw Cotton Bolls** (Surendranagar, GJ) — Export, ₹85/kg
14. **Black Gram (Split Urad Dal)** (Vijayawada, AP) — Grade A+, ₹110/kg
15. **Green Gram (Whole Moong Dal)** (Latur, MH) — Organic, ₹105/kg
16. **Bengal Gram (Desi Chana Dal)** (Indore, MP) — Grade A, ₹78/kg
17. **Fresh Leafy Coriander Bunches** (Pune, MH) — Grade A, ₹35/kg
18. **Ooty White Garlic Bulbs** (Ooty, TN) — Grade A+, ₹160/kg
19. **Wayanad Fresh Earthy Ginger** (Wayanad, KL) — Export, ₹120/kg
20. **Crunchy Orange Carrots** (Hoshiarpur, PB) — Grade A, ₹36/kg
21. **Purple Glossy Brinjal / Eggplant** (Warangal, TS) — Grade A, ₹30/kg
22. **Tender Green Okra / Bhindi** (Chittoor, AP) — Grade A, ₹40/kg

---

### 2. 4 Continuous Background Scrolling Videos on Homepage
As the user scrolls down the homepage, 4 distinct, full-width high-definition background videos play continuously with high-contrast readable overlays:
- **Video 1 (Section 1 - Hero Banner)**: Aerial Farmland & Sunrise Crops Drone footage behind headline, mission badge, stats, and search.
- **Video 2 (Section 2 - Farm-Gate Direct)**: Farmers harvesting ripe crops in the field behind farmer value proposition, zero-middleman guarantees, and registration.
- **Video 3 (Section 4 - Verified Merchant Network)**: Wholesale Mandi Market sorting and quality inspection behind merchant benefits and dynamic price engine.
- **Video 4 (Section 7 - Agricultural Freight Corridor)**: Highway freight truck at sunset behind cold-chain temperature telemetry, freight rate calculators, and the interactive Leaflet route map.

---

### 3. Grounded Zero-Hallucination AI & Live Voice Assistant
- **Strict Anti-Hallucination Rules**: Dispatches user intent directly to verified database tools (`searchProducts`, `getProduct`, `checkInventory`, `getProductPrice`, `searchFarmers`, `getOrderStatus`, `getRoute`). If produce or pricing is unverified, responds transparently: *"I don't have verified information for that right now."*
- **Multilingual Voice AI**: Interactive floating microphone button with Web Speech Recognition (`en-IN`), real-time audio wave visualizer, and Web Speech Synthesis reading replies aloud.

---

### 4. Interactive Multimodal Agrilogistics
- Embedded Leaflet routing map with customizable multi-stop waypoints (Farm Gate &rarr; Cold Chain Hub &rarr; APMC Mandi &rarr; Consumer Hub).
- Live calculation of total distance (km), estimated transit time (ETA in hours), reefer cold storage temperature range, and freight pricing.

---

### 5. Multi-Factor Smart Matching for Institutional Bulk Buyers
- Bulk procurement portal matching buyers and farmers on 4 weighted algorithmic factors:
  - Quantity Fulfillment (35%)
  - Location Proximity (25%)
  - Price Feasibility (25%)
  - Timing & Harvest Freshness (15%)

---

## 🚀 Live Services & Ports

| Component | Port | URL |
|---|---|---|
| **Frontend Web App** | `5173` | [http://localhost:5173](http://localhost:5173) |
| **Backend REST API** | `5000` | [http://localhost:5000](http://localhost:5000) |
| **API Health Check** | `5000` | [http://localhost:5000/api/health](http://localhost:5000/api/health) |

---

## 🔑 Demo Login Accounts

All test accounts share the password: **`AgriTrade@2026`** (with 1-click quick-fill buttons on the login screen):

| Role | Email |
|---|---|
| **Admin** | `admin@agritradehub.ai` |
| **Farmer / FPO** | `farmer.ramesh@agritradehub.ai` |
| **Seller / Merchant** | `seller.suresh@agritradehub.ai` |
| **Consumer** | `consumer.anita@agritradehub.ai` |
| **Bulk Buyer** | `buyer.reliance@agritradehub.ai` |

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite 6, TypeScript, Tailwind CSS, Lucide Icons, Leaflet / React Leaflet, Canvas Confetti, Web Speech Audio API.
- **Backend**: Node.js, Express.js (ES Modules), Mongoose, Nodemailer, JWT, bcryptjs, Helmet, CORS, Morgan.
- **Database**: MongoDB (Atlas Cloud + Resilient Local Synchronization Cache).
- **Email**: Real SMTP via Gmail (`kasanimanikanta2005@gmail.com`).
