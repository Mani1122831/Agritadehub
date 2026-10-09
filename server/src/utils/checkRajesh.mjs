import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const found = await Product.find({ name: /Rajesh/i });
  console.log('Found documents:', JSON.stringify(found, null, 2));

  // If found, update its image to verified local tomato image /products/p001/image-1.jpg or remove it if demo duplicate
  if (found.length > 0) {
    for (const doc of found) {
      console.log('Updating document:', doc._id);
      await Product.updateOne({ _id: doc._id }, {
        $set: {
          image: '/products/p001/image-1.jpg',
          images: ['/products/p001/image-1.jpg', '/products/p001/image-2.jpg', '/products/p001/image-3.jpg'],
          gallery: ['/products/p001/image-1.jpg', '/products/p001/image-2.jpg', '/products/p001/image-3.jpg'],
          productId: 'p001',
        }
      });
    }
    console.log('Updated Rajesh products to local verified tomato images.');
  }

  process.exit(0);
}
check();
