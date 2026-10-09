export interface BulkBuyerDemand {
  _id: string;
  tenderId: string;
  buyerName: string;
  companyName: string;
  businessType: 'Supermarket Chain' | 'Agri Exporter' | 'Food Processing Plant' | 'Quick Commerce' | 'Mandi Commission House';
  buyerEmail: string;
  buyerPhone: string;
  productName: string;
  category: string;
  requiredQuantity: number;
  unit: string;
  targetMaxPrice: number;
  deliveryLocation: string;
  destinationState: string;
  deliveryDeadline: string;
  paymentTerms: string;
  qualitySpecs: string;
  status: 'OPEN_FOR_BIDS' | 'UNDER_EVALUATION' | 'MATCHED' | 'DISPATCH_IN_PROGRESS';
  matchedFpoCount: number;
  totalBidsReceived: number;
  verifiedEnterprise: boolean;
  corporateLogo: string;
  notes: string;
}

export const fallbackBuyers: BulkBuyerDemand[] = [
  {
    _id: 'demand_01',
    tenderId: 'TNDR-ITC-2026-981',
    buyerName: 'ITC Agri-Business Procurement Division',
    companyName: 'ITC Limited - e-Choupal Network',
    businessType: 'Food Processing Plant',
    buyerEmail: 'procure.wheat@itc.in',
    buyerPhone: '+91 33228 89300',
    productName: 'MP Sharbati Golden Wheat (Aashirvaad Grade)',
    category: 'Grains',
    requiredQuantity: 2500,
    unit: 'Tonnes',
    targetMaxPrice: 42,
    deliveryLocation: 'ITC Flours Factory, Malanpur Industrial Area',
    destinationState: 'Madhya Pradesh',
    deliveryDeadline: '2026-10-25',
    paymentTerms: '100% Escrow on Quality Certificate Approval (3 Days)',
    qualitySpecs: 'Moisture < 11.5%, Foreign matter < 0.5%, Protein > 12.5%, Zero infestation',
    status: 'OPEN_FOR_BIDS',
    matchedFpoCount: 6,
    totalBidsReceived: 18,
    verifiedEnterprise: true,
    corporateLogo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=300&q=80',
    notes: 'Long-term standing contract for Aashirvaad premium flour blend. Continuous delivery over 3 months.'
  },
  {
    _id: 'demand_02',
    tenderId: 'TNDR-REL-2026-442',
    buyerName: 'Reliance Retail Fresh Distribution Hub',
    companyName: 'Reliance Retail Ventures Ltd',
    businessType: 'Supermarket Chain',
    buyerEmail: 'procurement.fresh@relretail.com',
    buyerPhone: '+91 22447 70000',
    productName: 'Nasik Red Onions (Medium-Large Grade)',
    category: 'Vegetables',
    requiredQuantity: 1800,
    unit: 'Tonnes',
    targetMaxPrice: 28,
    deliveryLocation: 'Reliance Fresh Central DC, Bhiwandi Logistics Hub',
    destinationState: 'Maharashtra',
    deliveryDeadline: '2026-10-20',
    paymentTerms: 'Direct NEFT within 48 Hours of DC Inward Gate Pass',
    qualitySpecs: 'Size 45-60mm, Double-skin red, Moisture dry cured, Zero sprouting',
    status: 'OPEN_FOR_BIDS',
    matchedFpoCount: 8,
    totalBidsReceived: 24,
    verifiedEnterprise: true,
    corporateLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
    notes: 'Supplying 1,400+ Smart Point & Reliance Fresh retail supermarkets across Western India.'
  },
  {
    _id: 'demand_03',
    tenderId: 'TNDR-BB-2026-118',
    buyerName: 'BigBasket Fresh Farm Direct Hub',
    companyName: 'Supermarket Grocery Supplies Pvt Ltd',
    businessType: 'Quick Commerce',
    buyerEmail: 'farmerconnect@bigbasket.com',
    buyerPhone: '+91 80682 99000',
    productName: 'Fresh Farm Vine Tomatoes (Hybrid Grade A)',
    category: 'Vegetables',
    requiredQuantity: 650,
    unit: 'Tonnes',
    targetMaxPrice: 32,
    deliveryLocation: 'BigBasket Tier-1 DC, Soukya Road, Whitefield',
    destinationState: 'Karnataka',
    deliveryDeadline: '2026-10-18',
    paymentTerms: 'Weekly automated clearing cycle to farmer bank account',
    qualitySpecs: 'Firm pink-red stage, 60-80g per piece, Crates delivery, Zero pesticide residues',
    status: 'OPEN_FOR_BIDS',
    matchedFpoCount: 5,
    totalBidsReceived: 14,
    verifiedEnterprise: true,
    corporateLogo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=300&q=80',
    notes: 'Daily collection center intake with automated cold-chain refrigerated transit vans.'
  },
  {
    _id: 'demand_04',
    tenderId: 'TNDR-MDH-2026-559',
    buyerName: 'MDH Spices Raw Materials Division',
    companyName: 'Mahashian Di Hatti Private Limited',
    businessType: 'Food Processing Plant',
    buyerEmail: 'purchase.spices@mdhspices.in',
    buyerPhone: '+91 11255 08800',
    productName: 'Guntur Teja S17 Dried Red Chillies (Stemless)',
    category: 'Spices',
    requiredQuantity: 400,
    unit: 'Tonnes',
    targetMaxPrice: 220,
    deliveryLocation: 'MDH Processing Mill, Kirti Nagar Industrial Area, Delhi NCR',
    destinationState: 'Delhi NCR',
    deliveryDeadline: '2026-11-05',
    paymentTerms: '20% Advance on loading, 80% on lab ASTA color certification',
    qualitySpecs: 'SHU > 75,000, ASTA Color > 60, Moisture < 10%, Aflatoxin compliant',
    status: 'OPEN_FOR_BIDS',
    matchedFpoCount: 4,
    totalBidsReceived: 9,
    verifiedEnterprise: true,
    corporateLogo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=300&q=80',
    notes: 'Required for national ground chilli and garam masala manufacturing lines.'
  },
  {
    _id: 'demand_05',
    tenderId: 'TNDR-ZOM-2026-773',
    buyerName: 'Zomato Hyperpure B2B Supplies',
    companyName: 'Hyperpure by Zomato',
    businessType: 'Quick Commerce',
    buyerEmail: 'sourcing@hyperpure.com',
    buyerPhone: '+91 12440 98570',
    productName: 'Andhra Sona Masoori Raw Aged Rice (12 Months Aged)',
    category: 'Grains',
    requiredQuantity: 900,
    unit: 'Tonnes',
    targetMaxPrice: 62,
    deliveryLocation: 'Hyperpure Fulfillment Center, Shamshabad Airport Road',
    destinationState: 'Telangana',
    deliveryDeadline: '2026-10-30',
    paymentTerms: 'T+3 Business Days from warehouse delivery inspection',
    qualitySpecs: 'Single polished, zero chalky grain, 12-month natural aging certificate',
    status: 'OPEN_FOR_BIDS',
    matchedFpoCount: 7,
    totalBidsReceived: 21,
    verifiedEnterprise: true,
    corporateLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80',
    notes: 'Supplying 15,000+ restaurants, cloud kitchens, and institutional caterers in Hyderabad & Bengaluru.'
  },
  {
    _id: 'demand_06',
    tenderId: 'TNDR-MOTHER-2026-302',
    buyerName: 'Mother Dairy Fruit & Vegetable Pvt Ltd (Safal)',
    companyName: 'National Dairy Development Board Subsidary',
    businessType: 'Supermarket Chain',
    buyerEmail: 'procure.safal@motherdairy.com',
    buyerPhone: '+91 12028 12000',
    productName: 'Ratnagiri Alphonso & Banganapalli Mangoes',
    category: 'Fruits',
    requiredQuantity: 800,
    unit: 'Tonnes',
    targetMaxPrice: 150,
    deliveryLocation: 'Safal Processing Plant, Mangolpuri Industrial Area',
    destinationState: 'Delhi NCR',
    deliveryDeadline: '2026-11-15',
    paymentTerms: 'NDDB standard 7-day cooperative direct payout',
    qualitySpecs: 'Brix > 18.5%, Naturally ripened without calcium carbide, Export Grade 1',
    status: 'OPEN_FOR_BIDS',
    matchedFpoCount: 5,
    totalBidsReceived: 12,
    verifiedEnterprise: true,
    corporateLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
    notes: 'Sourcing pulpable and table-grade mangoes for Safal outlets across Delhi NCR.'
  },
  {
    _id: 'demand_07',
    tenderId: 'TNDR-BALAJI-2026-664',
    buyerName: 'Balaji Wafers Snack Processing Plant',
    companyName: 'Balaji Wafers Pvt Ltd',
    businessType: 'Food Processing Plant',
    buyerEmail: 'rawmaterial@balajiwafers.com',
    buyerPhone: '+91 28127 83700',
    productName: 'Agra Jyoti Crisp Processing Potatoes (Sugar < 0.1%)',
    category: 'Vegetables',
    requiredQuantity: 4000,
    unit: 'Tonnes',
    targetMaxPrice: 22,
    deliveryLocation: 'Balaji Mega Plant, Valsad / Rajkot Highway',
    destinationState: 'Gujarat',
    deliveryDeadline: '2026-10-28',
    paymentTerms: 'Immediate advance against weighbridge inward receipt',
    qualitySpecs: 'Sugar < 0.1% reducing sugar, Dry matter > 21%, Size > 55mm oval, zero hollow heart',
    status: 'OPEN_FOR_BIDS',
    matchedFpoCount: 9,
    totalBidsReceived: 31,
    verifiedEnterprise: true,
    corporateLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80',
    notes: 'High-volume potato requirement for batch crisp frying lines. Temperature-controlled delivery required.'
  },
  {
    _id: 'demand_08',
    tenderId: 'TNDR-SYNTH-2026-892',
    buyerName: 'Synthite Industries Oleoresin Extraction Hub',
    companyName: 'Synthite Industries Bio-Ingredients Ltd',
    businessType: 'Agri Exporter',
    buyerEmail: 'oleo.spices@synthite.com',
    buyerPhone: '+91 48430 55000',
    productName: 'Wayanad Malabar Black Peppercorns (Tellicherry TGSEB)',
    category: 'Spices',
    requiredQuantity: 250,
    unit: 'Tonnes',
    targetMaxPrice: 680,
    deliveryLocation: 'Synthite Bio-Park, Kolenchery, Kochi',
    destinationState: 'Kerala',
    deliveryDeadline: '2026-11-20',
    paymentTerms: 'Letter of Credit / Verified Escrow Direct Payout',
    qualitySpecs: 'Piperine content > 4.5%, Essential oil > 2.8%, Bulk density 550g/l, FSSAI & FDA clean',
    status: 'OPEN_FOR_BIDS',
    matchedFpoCount: 3,
    totalBidsReceived: 8,
    verifiedEnterprise: true,
    corporateLogo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80',
    notes: 'Extracted for natural oleoresin and flavor exports to Europe, Japan, and North America.'
  }
];
