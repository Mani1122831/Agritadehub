import express from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import {
  getFrames,
  uploadFrames,
  applyWorkspaceZip,
} from '../controllers/frameController.js';

const router = express.Router();

const upload = multer({
  dest: path.join(os.tmpdir(), 'agritrade_frame_uploads'),
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB max archive/file size
    files: 1000, // up to 1000 frame files if uploading folder
  },
});

// GET current frames
router.get('/', getFrames);

// POST upload frames (accepts single zip or multiple frame files)
router.post(
  '/upload',
  upload.fields([
    { name: 'zipFile', maxCount: 1 },
    { name: 'files', maxCount: 1000 },
    { name: 'file', maxCount: 1 },
  ]),
  uploadFrames
);

// POST apply workspace zip directly
router.post('/apply-workspace-zip', applyWorkspaceZip);

export default router;
