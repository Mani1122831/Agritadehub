import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import { masterProductCatalog } from './productCatalog.js';

import path from 'path';

dotenv.config({ path: path.resolve('server/.env') });

async function sync() {
  try {
    console.log('[SyncMongo] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('[SyncMongo] Connected. Updating products with masterProductCatalog...');

    for (const item of masterProductCatalog) {
      // Find by _id, id, or productId, or exact name
      const filter = {
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(item._id) ? item._id : undefined },
          { productId: item.productId },
          { name: item.name },
        ].filter(Boolean)
      };

      const updateData = {
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        unit: item.unit,
        stock: item.stock,
        minOrderQuantity: item.minOrderQuantity,
        farmerName: item.farmerName,
        sellerName: item.sellerName,
        location: item.location,
        harvestDate: item.harvestDate ? new Date(item.harvestDate) : new Date(),
        quality: item.quality,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
        image: item.image,
        images: item.images,
        gallery: item.gallery,
        video: item.video,
        productId: item.productId,
        specifications: item.specifications,
        isOrganic: item.isOrganic,
        isFeatured: item.isFeatured,
        isApproved: item.isApproved,
      };

      const res = await Product.findOneAndUpdate(filter, { $set: updateData }, { upsert: true, new: true });
      console.log(`[Synced] ${res.name} -> images: ${res.images?.length}, productId: ${res.productId}`);
    }

    const total = await Product.countDocuments();
    console.log(`[SyncMongo SUCCESS] Total products in MongoDB Atlas: ${total}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[SyncMongo Error]:', err.message);
    process.exit(1);
  }
}

sync();
