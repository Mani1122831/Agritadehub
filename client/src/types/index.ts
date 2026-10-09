export type UserRole = 'consumer' | 'farmer' | 'seller' | 'buyer' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organization?: string;
  location?: {
    address?: string;
    city: string;
    state: string;
    district?: string;
    lat?: number;
    lng?: number;
  };
  avatar?: string;
  isApproved?: boolean;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  minOrderQuantity: number;
  farmer?: string;
  farmerName?: string;
  seller?: string;
  sellerName?: string;
  location: {
    address?: string;
    city: string;
    state: string;
    lat?: number;
    lng?: number;
  };
  harvestDate?: string;
  quality: string;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  gallery?: string[];
  video?: string | null;
  productId?: string;
  specifications?: Record<string, any>;
  isOrganic?: boolean;
  isFeatured?: boolean;
  isApproved?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'packed'
    | 'dispatched'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  trackingHistory: {
    status: string;
    note: string;
    timestamp: string;
  }[];
  estimatedDelivery: string;
  createdAt: string;
}

export interface BuyerRequirement {
  _id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  maxPricePerUnit: number;
  targetLocation: string;
  targetDate: string;
  status: 'open' | 'in_negotiation' | 'fulfilled' | 'closed';
  matchedSuppliers: {
    supplierName: string;
    supplierRole: string;
    availableQuantity: number;
    offeredPrice: number;
    location: string;
    distanceKm: number;
    matchScore: number;
    matchReasons: string[];
    status: string;
  }[];
  createdAt: string;
}
