import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
  subtotal: { type: Number, required: true },
  farmerId: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
  sellerId: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay Sandbox', 'UPI Test', 'Cash On Delivery'],
      default: 'Razorpay Sandbox',
    },
    paymentId: { type: String, default: '' },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'packed',
        'dispatched',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'confirmed',
    },
    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days
    },
    trackingHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    // Idempotency & Email notification audit flags
    customerEmailSent: { type: Boolean, default: false },
    adminEmailSent: { type: Boolean, default: false },
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
