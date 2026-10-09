import {
  getGoogleSheetsStatus,
  syncDatabaseToGoogleSheets,
  shareSpreadsheetWithPartner,
} from '../services/googleSheetsService.js';
import SyncAudit from '../models/SyncAudit.js';
import PartnerShareAudit from '../models/PartnerShareAudit.js';

/**
 * @desc Get Google Sheets Connection Status and Configuration
 * @route GET /api/admin/google-sheets/status
 * @access Private (Admin only)
 */
export const getStatus = async (req, res) => {
  try {
    const statusData = await getGoogleSheetsStatus();
    res.json({
      success: true,
      ...statusData,
    });
  } catch (error) {
    console.error('[Google Sheets Status Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Google Sheets connection status.',
      error: error.message,
    });
  }
};

/**
 * @desc Trigger manual synchronization to Google Sheets
 * @route POST /api/admin/google-sheets/sync
 * @access Private (Admin only)
 */
export const triggerSync = async (req, res) => {
  try {
    const { selectedDatasets, customSpreadsheetId } = req.body;
    const adminUser = req.user?.email || 'kasanimanikanta2005@gmail.com';

    const result = await syncDatabaseToGoogleSheets({
      adminUser,
      selectedDatasets: Array.isArray(selectedDatasets) ? selectedDatasets : [],
      customSpreadsheetId,
    });

    res.json({
      success: true,
      message: 'Synchronization to Google Sheets completed successfully.',
      ...result,
    });
  } catch (error) {
    console.error('[Google Sheets Sync Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Google Sheets synchronization failed. Please check admin integration settings.',
    });
  }
};

/**
 * @desc Share Spreadsheet with an External Partner via Google Drive
 * @route POST /api/admin/google-sheets/share
 * @access Private (Admin only)
 */
export const shareWithPartner = async (req, res) => {
  try {
    const { partnerEmail, accessLevel, datasets } = req.body;
    const adminUser = req.user?.email || 'kasanimanikanta2005@gmail.com';

    if (!partnerEmail || !partnerEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Partner email is required.',
      });
    }

    const result = await shareSpreadsheetWithPartner({
      partnerEmail,
      accessLevel: accessLevel || 'viewer',
      datasets: Array.isArray(datasets) ? datasets : [],
      adminUser,
    });

    res.json({
      success: true,
      message: `Spreadsheet successfully shared with ${partnerEmail} as ${accessLevel || 'Viewer'}.`,
      ...result,
    });
  } catch (error) {
    console.error('[Google Drive Share Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to share spreadsheet with partner. Please verify Google Drive permissions.',
    });
  }
};

/**
 * @desc Get Sync Audit and Partner Sharing Activity Logs
 * @route GET /api/admin/google-sheets/audit
 * @access Private (Admin only)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const [syncAudits, shareAudits] = await Promise.all([
      SyncAudit.find().sort({ createdAt: -1 }).limit(30),
      PartnerShareAudit.find().sort({ createdAt: -1 }).limit(30),
    ]);

    res.json({
      success: true,
      syncAudits,
      shareAudits,
    });
  } catch (error) {
    console.error('[Google Sheets Audit Fetch Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs.',
      error: error.message,
    });
  }
};

/**
 * @desc Get safe public config for frontend admin display
 * @route GET /api/admin/google-sheets/config
 * @access Private (Admin only)
 */
export const getConfig = async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
    res.json({
      success: true,
      config: {
        spreadsheetId,
        spreadsheetName: 'AgriTrade Hub AI – Partner Data',
        spreadsheetUrl: spreadsheetId
          ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
          : '',
        serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
        sheetsEnabled: process.env.GOOGLE_SHEETS_ENABLED === 'true',
        autoSyncEnabled: process.env.GOOGLE_SHEETS_AUTO_SYNC_ENABLED === 'true',
        driveSharingEnabled: process.env.GOOGLE_DRIVE_SHARING_ENABLED !== 'false',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration.',
    });
  }
};
