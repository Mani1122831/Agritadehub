import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    type: {
      type: String,
      enum: ['otp', 'order_confirmation_customer', 'order_notification_admin', 'welcome', 'system', 'partner_share'],
      required: true,
    },
    referenceId: { type: String, index: true }, // OrderId or User Email for idempotency check
    status: {
      type: String,
      enum: ['sent', 'simulated', 'failed'],
      required: true,
    },
    messageId: { type: String },
    error: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);
