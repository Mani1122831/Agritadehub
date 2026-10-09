import mongoose from 'mongoose';

const syncAuditSchema = new mongoose.Schema(
  {
    syncId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    admin: {
      type: String,
      required: true,
      default: 'kasanimanikanta2005@gmail.com',
    },
    source: {
      type: String,
      default: 'AgriTrade Hub Database',
    },
    sheetsUpdated: {
      type: Number,
      default: 0,
    },
    rowsUpdated: {
      type: Number,
      default: 0,
    },
    rowsAdded: {
      type: Number,
      default: 0,
    },
    rowsFailed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PARTIAL', 'FAILED', 'IN_PROGRESS'],
      default: 'IN_PROGRESS',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    datasets: {
      type: [String],
      default: [],
    },
    spreadsheetId: {
      type: String,
      default: '',
    },
    spreadsheetUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.models.SyncAudit || mongoose.model('SyncAudit', syncAuditSchema);
