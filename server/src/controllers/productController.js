import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { resilientStore } from '../utils/resilientStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc Get all products
export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, isOrganic, page = 1, limit = 50 } = req.query;

    if (isDbConnected()) {
      try {
        const query = { isApproved: true };
        if (search && search.trim()) {
          const s = search.trim();
          query.$or = [
            { name: { $regex: s, $options: 'i' } },
            { description: { $regex: s, $options: 'i' } },
            { category: { $regex: s, $options: 'i' } },
            { 'location.city': { $regex: s, $options: 'i' } },
            { 'location.state': { $regex: s, $options: 'i' } },
            { farmerName: { $regex: s, $options: 'i' } },
            { sellerName: { $regex: s, $options: 'i' } },
          ];
        }
        if (category && category !== 'All') query.category = category;
        if (minPrice || maxPrice) {
          query.price = {};
          if (minPrice) query.price.$gte = Number(minPrice);
          if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (isOrganic === 'true') query.isOrganic = true;

        const total = await Product.countDocuments(query);
        const products = await Product.find(query).limit(Number(limit));
        return res.json({ success: true, count: products.length, total, products });
      } catch (e) {
        console.warn('Fallback to resilient store for products');
      }
    }

    // Resilient fallback
    let list = resilientStore.products;
    if (search) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s)) ||
          (p.farmerName && p.farmerName.toLowerCase().includes(s)) ||
          (p.sellerName && p.sellerName.toLowerCase().includes(s)) ||
          (p.location?.city && p.location.city.toLowerCase().includes(s)) ||
          (p.location?.state && p.location.state.toLowerCase().includes(s))
      );
    }
    if (category && category !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
    if (isOrganic === 'true') list = list.filter((p) => p.isOrganic);

    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);

    res.json({ success: true, count: list.length, total: list.length, products: list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
};

// @desc Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const prods = await Product.find({ isApproved: true, isFeatured: true }).limit(8);
        if (prods.length > 0) return res.json({ success: true, products: prods });
      } catch (e) {}
    }
    const featured = resilientStore.products.filter((p) => p.isFeatured).slice(0, 8);
    res.json({ success: true, products: featured.length > 0 ? featured : resilientStore.products.slice(0, 8) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
  }
};

// @desc Get product categories
export const getCategories = async (req, res) => {
  try {
    const catMap = {};
    resilientStore.products.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    const categories = Object.keys(catMap).map((name) => ({ _id: name, count: catMap[name] }));
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// @desc Get product by ID
export const getProductById = async (req, res) => {
  try {
    const rawId = req.params.id?.trim();
    if (!rawId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    if (isDbConnected()) {
      try {
        let prod = null;
        if (mongoose.Types.ObjectId.isValid(rawId)) {
          prod = await Product.findById(rawId);
        }
        if (!prod) {
          prod = await Product.findOne({
            $or: [{ _id: rawId }, { id: rawId }, { productId: rawId }],
          });
        }
        if (prod) {
          const related = await Product.find({ category: prod.category, _id: { $ne: prod._id } }).limit(4);
          return res.json({ success: true, product: prod, related });
        }
      } catch (e) {}
    }

    // Resilient lookup: match _id, id, or productId strictly
    const prod = resilientStore.products.find(
      (p) => p._id === rawId || p.id === rawId || p.productId === rawId
    );

    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = resilientStore.products
      .filter((p) => p.category === prod.category && p._id !== prod._id)
      .slice(0, 4);

    res.json({ success: true, product: prod, related });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Product not found', error: error.message });
  }
};

// @desc Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      stock,
      unit = 'kg',
      quality = 'Grade A',
      image,
      gallery,
      isOrganic = false,
      harvestDate,
      location,
      farmerName,
      sellerName,
    } = req.body;

    if (!name || !category || !description || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required product details' });
    }

    const primaryImage = image || (Array.isArray(gallery) && gallery[0]) || '';
    let productGallery = Array.isArray(gallery) ? gallery.filter(Boolean) : (image ? [image] : []);
    if (primaryImage && !productGallery.includes(primaryImage)) {
      productGallery.unshift(primaryImage);
    }

    const prodData = {
      name: name.trim(),
      category,
      description,
      price: Number(price),
      stock: Number(stock),
      unit,
      quality,
      image: primaryImage,
      gallery: productGallery,
      isOrganic: Boolean(isOrganic),
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      location: location || req.user?.location || { city: 'Guntur', state: 'Andhra Pradesh' },
      isApproved: true,
      rating: 4.8,
      reviewsCount: 1,
    };

    if (req.user) {
      if (req.user.role === 'seller') {
        prodData.seller = req.user._id;
        prodData.sellerName = req.user.organization || req.user.name;
      } else if (req.user.role === 'farmer') {
        prodData.farmer = req.user._id;
        prodData.farmerName = req.user.name;
      }
    }
    if (sellerName && !prodData.sellerName) prodData.sellerName = sellerName;
    if (farmerName && !prodData.farmerName) prodData.farmerName = farmerName;

    let savedProduct = null;
    if (isDbConnected()) {
      try {
        savedProduct = await Product.create(prodData);
      } catch (dbErr) {
        console.error('[Product DB Create Error]:', dbErr.message);
      }
    }

    if (!savedProduct) {
      const fallbackId = `prod_${Date.now()}`;
      savedProduct = { _id: fallbackId, id: fallbackId, ...prodData, createdAt: new Date(), updatedAt: new Date() };
    }

    resilientStore.products.unshift(savedProduct);
    return res.status(201).json({ success: true, message: 'Product created successfully', product: savedProduct });
  } catch (error) {
    console.error('[Create Product Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

// @desc Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updatedProduct = null;

    if (isDbConnected()) {
      try {
        updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      } catch (e) {
        console.warn('[Product DB Update Warning]:', e.message);
      }
    }

    const idx = resilientStore.products.findIndex((p) => String(p._id) === String(id) || String(p.id) === String(id));
    if (idx !== -1) {
      resilientStore.products[idx] = { ...resilientStore.products[idx], ...req.body, updatedAt: new Date() };
      if (!updatedProduct) updatedProduct = resilientStore.products[idx];
    }

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
};

// @desc Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        await Product.findByIdAndDelete(id);
      } catch (e) {
        console.warn('[Product DB Delete Warning]:', e.message);
      }
    }

    const idx = resilientStore.products.findIndex((p) => String(p._id) === String(id) || String(p.id) === String(id));
    if (idx !== -1) {
      resilientStore.products.splice(idx, 1);
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
  }
};
