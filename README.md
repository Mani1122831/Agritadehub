# AgriTrade Hub AI — SIH 2026 (SIH26033)

> **From Farm to Market. One Intelligent Platform.**

AgriTrade Hub AI is a digital agricultural marketplace concept designed to connect **farmers and Farmer Producer Organizations (FPOs)** directly with **household consumers, retailers/merchants, and institutional bulk buyers**. Its goal is to make agricultural supply easier to discover, compare, purchase, and deliver, with AI-assisted matching and decision support.

> **Project status:** This README describes the intended application and local development setup. Features that depend on external credentials or third-party APIs—such as email OTP, AI responses, Google Sheets synchronization, maps, and payment processing—must be configured and tested in the target environment before being described as production-ready.

## Contents

- [Project Goals](#project-goals)
- [Core Workflows](#core-workflows)
- [Features](#features)
- [Agricultural Product Catalogue](#agricultural-product-catalogue)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Run Locally](#run-locally)
- [Environment Configuration](#environment-configuration)
- [Google Sheets Integration](#google-sheets-integration)
- [Security Notes](#security-notes)
- [Testing Checklist](#testing-checklist)
- [Roadmap](#roadmap)

## Project Goals

Agricultural producers can struggle to find suitable buyers, understand demand, compare prices, and coordinate delivery. Buyers may have difficulty finding supply that meets their required quantity, price, quality, location, and delivery date.

AgriTrade Hub AI aims to bring these workflows into one platform:

- Help farmers/FPOs publish produce availability and reach more buyers.
- Let consumers, merchants, and bulk buyers discover suitable listings.
- Match buyer requirements with available supply using transparent criteria.
- Provide useful price and demand insights when reliable data is available.
- Support order tracking, partner reporting, and logistics planning.

## Core Workflows

### Direct farm-to-buyer sales

```text
Farmer / FPO lists produce
          ↓
Marketplace stores the listing
          ↓
Buyer searches or submits a requirement
          ↓
Supply and demand are matched
          ↓
Buyer places an order
          ↓
Payment and fulfilment workflow
          ↓
Produce is delivered to the buyer
```

Buyers may include households, retailers, hotels, restaurants, food processors, and other institutional purchasers. Sellers/merchants can participate as an additional marketplace role, but **direct farmer/FPO-to-buyer commerce is the central workflow**.

### Admin reporting and partner sharing

```text
Application database
        ↓
Admin reviews allowed records
        ↓
Backend synchronizes selected data
        ↓
Google Sheets reporting layer
        ↓
Authorized partner access
```

Google Sheets is a reporting and collaboration layer—not the primary database or the payment system.

## Features

### Marketplace and user roles

- Role-oriented experiences for farmers/FPOs, merchants/sellers, consumers, bulk buyers, and administrators.
- Product browsing, search, product details, and availability information.
- Seller-side listing and inventory management, where enabled.
- Buyer cart, checkout, order history, and order status, where enabled.
- Bulk buyer requirements for larger quantities, price limits, locations, and required dates.
- Administrative views for users, products, and orders.

### AI-assisted marketplace intelligence

The intended AI workflow should use backend tools and trusted application data instead of inventing availability or prices. Possible tools include:

- `searchProducts`
- `getProduct`
- `checkInventory`
- `getProductPrice`
- `searchFarmers`
- `getOrderStatus`
- `getRoute`

If the application cannot verify a requested value, it should clearly say that verified information is unavailable rather than fabricate an answer.

Potential AI-assisted capabilities include:

- Matching buyer requirements with available farm supply.
- Price recommendations based on configured and traceable inputs.
- Demand analysis based on available historical data.
- Natural-language product search.
- Multilingual voice input and spoken responses, when supported by the browser and configured services.

**Forecasts and price recommendations are estimates, not guaranteed market outcomes.** External market data, weather, and mapping results require working data providers and appropriate configuration.

### Logistics planning

The application may provide route visualization and estimated distance or travel time using a configured mapping/routing provider. Estimates should be labelled as estimates and should not be represented as verified live transport prices unless a live source is connected.

### Google Sheets partner reporting

An administrator can synchronize selected, permitted application data to a spreadsheet when the backend Google APIs are configured. A complete integration should:

- Create or update named worksheet tabs.
- Use stable database IDs to prevent duplicate rows.
- Report actual sync counts and failures.
- Record synchronization activity.
- Share only an approved partner-facing dataset.

Never export passwords, password hashes, OTP values, tokens, private keys, database credentials, or other secrets to a spreadsheet.

## Agricultural Product Catalogue

The initial catalogue contains the following example listings. Names, origins, grades, and prices should be validated against the real product records before being treated as live offers.

| # | Product | Example location | Example price |
|---:|---|---|---:|
| 1 | Fresh Farm Tomatoes | Guntur, Andhra Pradesh | ₹32/kg |
| 2 | Nasik Red Onions | Nashik, Maharashtra | ₹28/kg |
| 3 | Agra Jyoti Potatoes | Agra, Uttar Pradesh | ₹22/kg |
| 4 | Banganapalli Golden Mangoes | Kurnool, Andhra Pradesh | ₹130/kg |
| 5 | Robusta Golden Bananas | Tiruchirappalli, Tamil Nadu | ₹45/kg |
| 6 | Aromatic Basmati Rice (1121) | Amritsar, Punjab | ₹95/kg |
| 7 | MP Sharbati Golden Wheat | Bhopal, Madhya Pradesh | ₹42/kg |
| 8 | Guntur Teja Red Chillies | Guntur, Andhra Pradesh | ₹220/kg |
| 9 | Fresh Green Chillies | Kolar, Karnataka | ₹48/kg |
| 10 | Lakadong Turmeric | Meghalaya | ₹180/kg |
| 11 | Raw Groundnuts | Rajkot, Gujarat | ₹90/kg |
| 12 | Yellow Maize / Corn | Davangere, Karnataka | ₹24/kg |
| 13 | Shankar-6 Raw Cotton | Surendranagar, Gujarat | ₹85/kg |
| 14 | Black Gram / Urad | Vijayawada, Andhra Pradesh | ₹110/kg |
| 15 | Green Gram / Moong | Latur, Maharashtra | ₹105/kg |
| 16 | Bengal Gram / Chana | Indore, Madhya Pradesh | ₹78/kg |
| 17 | Fresh Coriander | Pune, Maharashtra | ₹35/kg |
| 18 | White Garlic | Ooty, Tamil Nadu | ₹160/kg |
| 19 | Fresh Ginger | Wayanad, Kerala | ₹120/kg |
| 20 | Orange Carrots | Hoshiarpur, Punjab | ₹36/kg |
| 21 | Brinjal / Eggplant | Warangal, Telangana | ₹30/kg |
| 22 | Green Okra / Bhindi | Chittoor, Andhra Pradesh | ₹40/kg |

These values are **sample catalogue content**, not a guarantee of current market rates, certified origin, quality, inventory, or seller verification. Display verified values from the database in the live application.

## Homepage Media Concept

The homepage is designed around four distinct agricultural video sections:

1. **Farmland and sunrise** — crops and farm landscapes.
2. **Farm-gate harvest** — farmers harvesting produce.
3. **Wholesale market** — sorting, grading, and inspection.
4. **Agricultural logistics** — freight transport and delivery routes.

Use properly licensed or original media. Provide poster images, readable text overlays, and a reduced-motion or static fallback for accessibility and performance. Do not reuse unrelated product media as product evidence.

## Technology Stack

The expected stack, subject to the actual project files, includes:

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide icons.
- **Maps:** Leaflet / React Leaflet with a configured tile or routing provider.
- **Backend:** Node.js, Express.js, ES modules.
- **Database:** MongoDB with Mongoose; use the configured persistent database as the source of truth.
- **Authentication:** JWT and bcryptjs, with server-side authorization.
- **Email:** Nodemailer with configured SMTP for email OTP and notifications.
- **AI:** A configured AI provider accessed securely through the backend, with database/tool-grounded responses.
- **Partner reporting:** Google Sheets API and Google Drive API, when configured.

Check the repository's `package.json` files and implementation before assuming every item is already enabled.

## Architecture

```text
React / Vite Frontend
          ↓ HTTPS / REST API
Node.js / Express Backend
          ↓
Database (source of truth)
          ├── Authentication and roles
          ├── Products and inventory
          ├── Orders and fulfilment
          ├── AI tools and matching
          ├── Email notifications
          └── Admin reporting
                    ↓
        Google Sheets (reporting layer)
```

## Run Locally

### Prerequisites

Install the versions required by the project:

- Node.js and npm
- MongoDB Atlas connection or a local MongoDB instance
- Git
- Optional service credentials for SMTP, AI, Google Sheets, maps, and payments

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AgriTrade-Hub-AI.git
cd AgriTrade-Hub-AI
```

Replace the sample repository URL with the actual GitHub repository URL.

### 2. Install dependencies

Inspect the root and subfolders to find the relevant `package.json` files. If the project has separate `frontend` and `backend` folders, use two terminals.

**Terminal 1 — frontend**

```bash
cd client
npm install
npm run dev
```

**Terminal 2 — backend**

```bash
cd server
npm install
npm run dev
```

If your project uses a different folder structure or scripts, follow the `package.json` scripts in that repository rather than creating duplicate configuration.

### 3. Local addresses

The expected local development addresses are:

| Component | Address |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:5000` |
| Health check | `http://localhost:5000/api/health` |

These addresses work only when the corresponding services are running and configured to use those ports.

## Environment Configuration

Create local `.env` files in the locations expected by the application. Use `.env.example` to document variable names with placeholder values only.

Common configuration categories may include:

```env
# Database
MONGODB_URI=YOUR_DATABASE_CONNECTION_STRING

# Backend
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET

# SMTP / email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_EMAIL_ADDRESS
SMTP_PASS=YOUR_EMAIL_APP_PASSWORD
SMTP_FROM=YOUR_CONFIGURED_SENDER

# Google Sheets (backend only)
GOOGLE_SHEETS_ENABLED=false
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SPREADSHEET_ID=
```

These names are examples; **use the exact environment variable names read by the existing backend code**. Add AI-provider, map, and payment variables only when the corresponding feature is implemented. Never put private credentials in frontend-exposed variables such as `VITE_*`.

## Google Sheets Integration

For server-side spreadsheet synchronization:

1. Select the correct Google Cloud project.
2. Enable Google Sheets API and, if sharing permissions are managed by the application, Google Drive API.
3. Configure server-side authentication for the backend.
4. Create the spreadsheet and configure its ID.
5. Grant the service account access to the spreadsheet when using service-account authentication.
6. Test spreadsheet metadata access before attempting the full sync.
7. Click **Sync Now** and confirm that actual database records and accurate row counts appear in the sheet.
8. Share only a filtered partner-facing spreadsheet with external partners.

A “Connected” status should mean the backend has successfully tested access to the configured spreadsheet. A success message should only appear after the API operation succeeds.

## Security Notes

- Keep `.env`, downloaded service-account JSON files, private keys, access tokens, and database credentials out of Git.
- Never export passwords, password hashes, OTP values, OTP hashes, JWTs, API keys, SMTP secrets, or Google credentials.
- Hash passwords on the backend and enforce server-side role checks for protected routes.
- Validate and rate-limit authentication and OTP endpoints.
- Use test/sandbox mode for payment development until the provider and settlement flow are properly configured.
- Do not share the internal admin spreadsheet directly if it contains data that partners should not see.
- If a credential is exposed, revoke it and replace it immediately; removing it from `.gitignore` or a later commit does not remove it from Git history.
- Demo accounts, when present, must be development-only and must not use shared predictable passwords in production.

## Testing Checklist

Before presenting or deploying the application, verify the implemented flows end-to-end:

- [ ] User registration and login work with the configured database.
- [ ] Role permissions are enforced by the backend.
- [ ] A seller can create and update a product listing.
- [ ] Product IDs map to the correct product images.
- [ ] Search returns the correct product and stored data.
- [ ] A buyer can place an order and see its order history.
- [ ] Inventory and order status remain consistent after an order.
- [ ] Email OTP and order notifications work with configured SMTP.
- [ ] AI answers are grounded in actual product, inventory, and order data.
- [ ] Missing product images display a neutral placeholder, not an unrelated image.
- [ ] Google Sheets sync writes real records without duplicate rows.
- [ ] Partner sharing respects the selected dataset and access level.
- [ ] No credentials or security-sensitive fields are exported.
- [ ] Frontend build, backend checks, and relevant tests complete successfully.

## Roadmap

- [ ] Finish and validate every product-image mapping across the full catalogue.
- [ ] Complete seller/FPO listing and buyer order workflows against persistent database records.
- [ ] Validate AI matching with measurable test cases.
- [ ] Connect and verify real routing/distance data for logistics estimates.
- [ ] Complete Google Sheets synchronization and filtered partner sharing.
- [ ] Add payment-provider sandbox testing and compliant settlement handling, if required by the project scope.
- [ ] Add integration tests and a reliable deployment guide.

## Project

**AgriTrade Hub AI — SIH 2026 / SIH26033**

> **Mission:** Help farmers and FPOs reach the right buyers by bringing agricultural supply, buyer demand, trustworthy information, and logistics planning into one platform.
