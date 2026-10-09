import BuyerRequirement from '../models/BuyerRequirement.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { resilientStore } from '../utils/resilientStore.js';

// Haversine formula to compute distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 150; // default average distance
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// @desc Create Bulk Buyer Requirement and trigger Smart Matching
// @route POST /api/requirements
export const createRequirement = async (req, res) => {
  try {
    const { productName, category, quantity, unit, maxPricePerUnit, targetLocation, targetDate } = req.body;

    if (!productName || !quantity || !maxPricePerUnit || !targetLocation) {
      return res.status(400).json({ success: false, message: 'Please provide all requirement details' });
    }

    // Smart matching logic against available inventory and farmers/sellers
    const products = await Product.find({
      name: { $regex: productName, $options: 'i' },
      isApproved: true,
    }).populate('farmer', 'name phone location').populate('seller', 'name phone location');

    const matchedSuppliers = [];

    for (const prod of products) {
      let score = 50; // base score for produce type match
      const reasons = ['Produce variety matches requirement'];

      // 1. Price match (Up to +25 points)
      if (prod.price <= Number(maxPricePerUnit)) {
        score += 25;
        reasons.push(`Price ₹${prod.price}/${prod.unit} is at or below your max ceiling of ₹${maxPricePerUnit}`);
      } else if (prod.price <= Number(maxPricePerUnit) * 1.1) {
        score += 15;
        reasons.push(`Price ₹${prod.price} is within 10% negotiable tolerance of ceiling`);
      } else {
        reasons.push(`Price ₹${prod.price} is higher than targeted ceiling`);
      }

      // 2. Quantity / Stock availability (Up to +15 points)
      if (prod.stock >= Number(quantity)) {
        score += 15;
        reasons.push(`Full stock available: ${prod.stock} ${prod.unit} ready for procurement`);
      } else if (prod.stock >= Number(quantity) * 0.5) {
        score += 10;
        reasons.push(`Partial batch available: ${prod.stock} ${prod.unit} (can combine lots)`);
      } else {
        score += 5;
        reasons.push(`Limited stock: ${prod.stock} ${prod.unit}`);
      }

      // 3. Location / Distance (Up to +10 points)
      const dist = calculateDistance(17.3850, 78.4867, prod.location?.lat, prod.location?.lng);
      if (dist < 100) {
        score += 10;
        reasons.push(`Proximity match: Only ${dist} km from dispatch zone`);
      } else if (dist < 300) {
        score += 7;
        reasons.push(`Regional match: ${dist} km distance`);
      } else {
        score += 3;
        reasons.push(`Inter-state transport: ${dist} km`);
      }

      const finalMatchScore = Math.min(score, 99);

      matchedSuppliers.push({
        supplierId: prod.farmer?._id || prod.seller?._id,
        supplierName: prod.farmerName || prod.sellerName || 'Verified Agricultural Hub',
        supplierRole: prod.farmer ? 'Farmer / FPO' : 'Registered Merchant',
        availableQuantity: prod.stock,
        offeredPrice: prod.price,
        location: `${prod.location?.city || 'Guntur'}, ${prod.location?.state || 'AP'}`,
        distanceKm: dist,
        matchScore: finalMatchScore,
        matchReasons: reasons,
        status: 'pending',
      });
    }

    // Sort by best match score descending
    matchedSuppliers.sort((a, b) => b.matchScore - a.matchScore);

    const requirement = await BuyerRequirement.create({
      buyer: req.user._id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      buyerPhone: req.user.phone,
      productName,
      category: category || 'Vegetables',
      quantity: Number(quantity),
      unit: unit || 'kg',
      maxPricePerUnit: Number(maxPricePerUnit),
      targetLocation,
      targetDate: targetDate ? new Date(targetDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      matchedSuppliers,
    });

    res.status(201).json({
      success: true,
      message: 'Bulk requirement created and matched with available suppliers',
      requirement,
    });
  } catch (error) {
    console.error('Create requirement error:', error);
    res.status(500).json({ success: false, message: 'Failed to create requirement', error: error.message });
  }
};

// @desc Get requirements for current user or all open
// @route GET /api/requirements
export const getRequirements = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.role === 'buyer') {
      query = { buyer: req.user._id };
    }
    const requirements = await BuyerRequirement.find(query).sort({ createdAt: -1 });
    if (requirements.length > 0) {
      return res.json({ success: true, count: requirements.length, requirements });
    }
    res.json({
      success: true,
      count: (resilientStore.requirements || []).length,
      requirements: resilientStore.requirements || [],
    });
  } catch (error) {
    res.json({
      success: true,
      count: (resilientStore.requirements || []).length,
      requirements: resilientStore.requirements || [],
    });
  }
};

// @desc Get single requirement by ID
// @route GET /api/requirements/:id
export const getRequirementById = async (req, res) => {
  try {
    const requirement = await BuyerRequirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }
    res.json({ success: true, requirement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch requirement' });
  }
};
