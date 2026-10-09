import mongoose from 'mongoose';

const partnerShareAuditSchema = new mongoose.Schema(
  {
    partnerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    accessLevel: {
      type: String,
      enum: ['viewer', 'commenter', 'editor'],
      default: 'viewer',
    },
    datasets: {
      type: [String],
      default: [],
    },
    sharedBy: {
      type: String,
      required: true,
      default: 'kasanimanikanta2005@gmail.com',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
    spreadsheetId: {
      type: String,
      required: true,
    },
    spreadsheetUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['SHARED', 'REVOKED', 'FAILED'],
      default: 'SHARED',
    },
    emailNotified: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.models.PartnerShareAudit || mongoose.model('PartnerShareAudit', partnerShareAuditSchema);
