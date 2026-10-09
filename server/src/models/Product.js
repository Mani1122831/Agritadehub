import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Vegetables',
        'Fruits',
        'Grains',
        'Pulses',
        'Spices',
        'Oil Seeds',
        'Organic Products',
        'Other Agricultural Products',
      ],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    unit: {
      type: String,
      default: 'kg',
      enum: ['kg', 'quintal', 'crate', 'tonne', 'bag', 'bunch'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 100,
      min: 0,
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
    },
    farmer: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: false,
    },
    farmerName: {
      type: String,
      default: 'Kisan Producer Group',
    },
    seller: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: false,
    },
    sellerName: {
      type: String,
      default: 'AgriDirect Seller Network',
    },
    location: {
      city: { type: String, default: 'Guntur' },
      state: { type: String, default: 'Andhra Pradesh' },
      lat: { type: Number, default: 16.3067 },
      lng: { type: Number, default: 80.4365 },
    },
    harvestDate: {
      type: Date,
      default: Date.now,
    },
    quality: {
      type: String,
      enum: ['Grade A', 'Grade A+', 'Grade B', 'Export Quality', 'Organic Certified'],
      default: 'Grade A',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 24,
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    gallery: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
      default: null,
    },
    productId: {
      type: String,
      index: true,
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
