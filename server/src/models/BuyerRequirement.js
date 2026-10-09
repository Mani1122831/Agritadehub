import mongoose from 'mongoose';

const buyerRequirementSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    productName: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    maxPricePerUnit: { type: Number, required: true },
    targetLocation: { type: String, required: true },
    targetDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['open', 'in_negotiation', 'fulfilled', 'closed'],
      default: 'open',
    },
    matchedSuppliers: [
      {
        supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        supplierName: { type: String },
        supplierRole: { type: String },
        availableQuantity: { type: Number },
        offeredPrice: { type: Number },
        location: { type: String },
        distanceKm: { type: Number },
        matchScore: { type: Number },
        matchReasons: [String],
        status: { type: String, enum: ['pending', 'contacted', 'accepted', 'rejected'], default: 'pending' },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.BuyerRequirement || mongoose.model('BuyerRequirement', buyerRequirementSchema);
