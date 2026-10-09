import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  toggleUserApproval,
  getEmailLogs,
} from '../controllers/adminController.js';
import {
  getStatus as getGoogleSheetsStatus,
  triggerSync as triggerGoogleSheetsSync,
  shareWithPartner as shareGoogleSheetsWithPartner,
  getAuditLogs as getGoogleSheetsAuditLogs,
  getConfig as getGoogleSheetsConfig,
} from '../controllers/googleSheetsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-approval', toggleUserApproval);
router.get('/email-logs', getEmailLogs);

// Google Sheets & Partner Data Sharing Endpoints (Admin Only)
router.get('/google-sheets/status', getGoogleSheetsStatus);
router.post('/google-sheets/sync', triggerGoogleSheetsSync);
router.post('/google-sheets/share', shareGoogleSheetsWithPartner);
router.get('/google-sheets/audit', getGoogleSheetsAuditLogs);
router.get('/google-sheets/config', getGoogleSheetsConfig);

export default router;
