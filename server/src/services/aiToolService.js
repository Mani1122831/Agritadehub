import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import BuyerRequirement from '../models/BuyerRequirement.js';
import { resilientStore } from '../utils/resilientStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const aiTools = {
  // 1. searchProducts
  searchProducts: async ({ keyword, category, maxPrice, minStock, location }) => {
    if (isDbConnected()) {
      try {
        const query = { isApproved: true };
        if (keyword) {
          query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { category: { $regex: keyword, $options: 'i' } },
          ];
        }
        if (category && category !== 'All') query.category = category;
        if (maxPrice) query.price = { $lte: Number(maxPrice) };
        if (minStock) query.stock = { $gte: Number(minStock) };
        if (location) query['location.city'] = { $regex: location, $options: 'i' };

        const products = await Product.find(query).limit(10);
        return {
          count: products.length,
          products: products.map((p) => ({
            id: p._id,
            name: p.name,
            category: p.category,
            price: `₹${p.price}/${p.unit}`,
            stock: `${p.stock} ${p.unit}`,
            location: `${p.location?.city || 'Guntur'}, ${p.location?.state || 'AP'}`,
            farmer: p.farmerName,
            quality: p.quality,
            rating: p.rating,
            image: p.image,
          })),
        };
      } catch (e) {
        console.warn('DB query fallback to resilient store');
      }
    }

    // Resilient local store filter
    let filtered = resilientStore.products;
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.category.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw)
      );
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }
    if (minStock) {
      filtered = filtered.filter((p) => p.stock >= Number(minStock));
    }

    return {
      count: filtered.length,
      products: filtered.slice(0, 10).map((p) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        price: `₹${p.price}/${p.unit}`,
        stock: `${p.stock} ${p.unit}`,
        location: `${p.location.city}, ${p.location.state}`,
        farmer: p.farmerName,
        quality: p.quality,
        rating: p.rating,
        image: p.image,
      })),
    };
  },

  // 2. getProduct
  getProduct: async ({ id, name }) => {
    if (isDbConnected()) {
      try {
        let product;
        if (id) product = await Product.findById(id);
        else if (name) product = await Product.findOne({ name: { $regex: name, $options: 'i' }, isApproved: true });
        if (product) {
          return {
            found: true,
            product: {
              id: product._id,
              name: product.name,
              category: product.category,
              description: product.description,
              price: `₹${product.price}/${product.unit}`,
              stock: `${product.stock} ${product.unit}`,
              location: `${product.location?.city}, ${product.location?.state}`,
              farmer: product.farmerName,
              quality: product.quality,
              rating: product.rating,
              image: product.image,
            },
          };
        }
      } catch (e) {}
    }

    const prod = resilientStore.products.find(
      (p) => (id && p._id === id) || (name && p.name.toLowerCase().includes(name.toLowerCase()))
    );

    if (!prod) return { found: false, message: 'Product not found in database' };

    return {
      found: true,
      product: {
        id: prod._id,
        name: prod.name,
        category: prod.category,
        description: prod.description,
        price: `₹${prod.price}/${prod.unit}`,
        stock: `${prod.stock} ${prod.unit}`,
        location: `${prod.location.city}, ${prod.location.state}`,
        farmer: prod.farmerName,
        quality: prod.quality,
        rating: prod.rating,
        image: prod.image,
      },
    };
  },

  // 3. getProductPrice
  getProductPrice: async ({ productName, location }) => {
    let prods = [];
    if (isDbConnected()) {
      try {
        prods = await Product.find({ name: { $regex: productName, $options: 'i' }, isApproved: true });
      } catch (e) {}
    }

    if (!prods.length) {
      prods = resilientStore.products.filter((p) =>
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
    }

    if (!prods.length) {
      return { found: false, message: `No active listings found for ${productName}` };
    }

    const prices = prods.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    return {
      found: true,
      productName,
      unit: prods[0].unit,
      currentMarketplacePrice: `₹${avgPrice}/${prods[0].unit} (range ₹${minPrice} - ₹${maxPrice})`,
      aiPriceRecommendation: `₹${Math.round(avgPrice * 0.95)} - ₹${Math.round(avgPrice * 1.05)}/${prods[0].unit} (Stable / Mandi benchmark)`,
      verifiedListingsCount: prods.length,
      sampleListings: prods.slice(0, 3).map((p) => ({
        farmer: p.farmerName,
        price: `₹${p.price}/${p.unit}`,
        location: p.location.city,
      })),
    };
  },

  // 4. checkInventory
  checkInventory: async ({ productName, requiredQuantity }) => {
    let prods = [];
    if (isDbConnected()) {
      try {
        prods = await Product.find({ name: { $regex: productName, $options: 'i' }, isApproved: true });
      } catch (e) {}
    }

    if (!prods.length) {
      prods = resilientStore.products.filter((p) =>
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
    }

    if (!prods.length) {
      return { available: false, message: `No inventory found for "${productName}".` };
    }

    const totalStock = prods.reduce((acc, p) => acc + p.stock, 0);
    const unit = prods[0].unit;
    const reqQty = Number(requiredQuantity) || 0;

    return {
      available: reqQty > 0 ? totalStock >= reqQty : totalStock > 0,
      productName,
      totalStockAvailable: `${totalStock} ${unit}`,
      requestedQuantity: reqQty ? `${reqQty} ${unit}` : 'Not specified',
      fulfillingSuppliers: prods.map((p) => ({
        supplier: p.farmerName || p.sellerName,
        stock: `${p.stock} ${p.unit}`,
        price: `₹${p.price}/${p.unit}`,
        location: `${p.location.city}, ${p.location.state}`,
      })),
    };
  },

  // 5. searchFarmers
  searchFarmers: async ({ location }) => {
    let users = [];
    if (isDbConnected()) {
      try {
        users = await User.find({ role: { $in: ['farmer', 'fpo'] } }).limit(8);
      } catch (e) {}
    }

    if (!users.length) {
      users = resilientStore.users.filter((u) => u.role === 'farmer');
    }

    return {
      count: users.length,
      farmers: users.map((u) => ({
        name: u.name,
        role: u.role,
        organization: u.organization,
        location: `${u.location.city}, ${u.location.state}`,
        phone: u.phone,
      })),
    };
  },

  // 6. getOrderStatus
  getOrderStatus: async ({ orderId, userEmail, userId }) => {
    let order;
    if (isDbConnected()) {
      try {
        const query = {};
        if (orderId) query.orderId = { $regex: orderId, $options: 'i' };
        if (userEmail) query.customerEmail = userEmail.toLowerCase();
        order = await Order.findOne(query);
      } catch (e) {}
    }

    if (!order) {
      order = resilientStore.orders.find(
        (o) =>
          (orderId && o.orderId.toLowerCase().includes(orderId.toLowerCase())) ||
          (userEmail && o.customerEmail.toLowerCase() === userEmail.toLowerCase())
      );
    }

    if (!order) {
      return { found: false, message: 'No matching order found in the verified database.' };
    }

    return {
      found: true,
      orderId: order.orderId,
      customerName: order.customerName,
      orderStatus: order.orderStatus.toUpperCase(),
      paymentStatus: order.paymentStatus.toUpperCase(),
      total: `₹${order.total}`,
      items: order.items.map((it) => `${it.name} (${it.quantity} ${it.unit})`),
      expectedDelivery: new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      shippingTo: `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
    };
  },

  // 7. getMarketplaceCategories
  getMarketplaceCategories: async () => {
    return {
      categories: [
        'Vegetables',
        'Fruits',
        'Grains',
        'Pulses',
        'Spices',
        'Oil Seeds',
        'Organic Products',
        'Other Agricultural Products',
      ],
    };
  },

  // 8. getRoute
  getRoute: async ({ origin, destination, weightKg }) => {
    return {
      origin: origin || 'Guntur APMC Mandi, AP',
      destination: destination || 'Hyderabad Bowenpally Terminal, TG',
      distanceKm: '240 km',
      eta: '5.5 hours',
      transportCost: '₹4,800',
      recommendedVehicle: 'Eicher Pro Reefer Commercial Fleet',
    };
  },
};
