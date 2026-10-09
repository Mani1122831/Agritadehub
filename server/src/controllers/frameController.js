import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target frames directory in client/public/frames
export const getFramesDir = () => {
  return path.resolve(__dirname, '../../../client/public/frames');
};

const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * Scan directory and generate/update manifest.json
 */
const updateManifestFromDir = (framesDir) => {
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(framesDir);
  const imageFiles = files.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return validExtensions.has(ext);
  });

  imageFiles.sort(collator.compare);

  const manifest = {
    frames: imageFiles.map((fileName) => `/frames/${fileName}`),
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(framesDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  return manifest.frames;
};

/**
 * Clean existing frames from directory
 */
const cleanFramesDir = (framesDir) => {
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
    return;
  }
  const files = fs.readdirSync(framesDir);
  for (const file of files) {
    try {
      fs.rmSync(path.join(framesDir, file), { recursive: true, force: true });
    } catch (e) {
      console.warn(`Could not delete frame file ${file}:`, e.message);
    }
  }
};

/**
 * GET /api/frames
 * Retrieve current frames manifest
 */
export const getFrames = async (req, res) => {
  try {
    const framesDir = getFramesDir();
    const manifestPath = path.join(framesDir, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        if (Array.isArray(manifest.frames) && manifest.frames.length > 0) {
          return res.json({ success: true, frames: manifest.frames });
        }
      } catch (err) {
        console.warn('Could not parse manifest.json, regenerating...');
      }
    }

    const frames = updateManifestFromDir(framesDir);
    return res.json({ success: true, frames });
  } catch (error) {
    console.error('Error fetching frames:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve frames' });
  }
};

/**
 * POST /api/frames/upload
 * Handles uploading a ZIP file or multiple image files (from a folder)
 * Deletes previous frames and replaces them with the new frames
 */
export const uploadFrames = async (req, res) => {
  try {
    const framesDir = getFramesDir();

    // 1. Check if files were uploaded
    const uploadedFiles = req.files || [];
    const singleFile = req.file;

    // Handle zip file (either single file or inside files array)
    let zipFile = null;
    let imageFiles = [];

    if (singleFile) {
      if (singleFile.mimetype === 'application/zip' || singleFile.originalname.endsWith('.zip')) {
        zipFile = singleFile;
      } else if (validExtensions.has(path.extname(singleFile.originalname).toLowerCase())) {
        imageFiles.push(singleFile);
      }
    }

    if (Array.isArray(uploadedFiles)) {
      for (const f of uploadedFiles) {
        if (f.mimetype === 'application/zip' || f.originalname.endsWith('.zip')) {
          zipFile = f;
          break;
        } else if (validExtensions.has(path.extname(f.originalname).toLowerCase())) {
          imageFiles.push(f);
        }
      }
    } else if (uploadedFiles && typeof uploadedFiles === 'object') {
      // Multer fields or object format
      Object.values(uploadedFiles).forEach((group) => {
        if (Array.isArray(group)) {
          group.forEach((f) => {
            if (f.mimetype === 'application/zip' || f.originalname.endsWith('.zip')) {
              zipFile = f;
            } else if (validExtensions.has(path.extname(f.originalname).toLowerCase())) {
              imageFiles.push(f);
            }
          });
        }
      });
    }

    if (!zipFile && imageFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid ZIP file or image frames were provided.',
      });
    }

    // 2. Delete all existing frames first
    cleanFramesDir(framesDir);

    // 3. Process new frames
    if (zipFile) {
      const zip = new AdmZip(zipFile.path || zipFile.buffer);
      const entries = zip.getEntries();

      for (const entry of entries) {
        if (entry.isDirectory) continue;
        if (entry.entryName.includes('__MACOSX') || path.basename(entry.entryName).startsWith('.')) {
          continue;
        }
        const ext = path.extname(entry.entryName).toLowerCase();
        if (!validExtensions.has(ext)) continue;

        const baseName = path.basename(entry.entryName);
        fs.writeFileSync(path.join(framesDir, baseName), entry.getData());
      }

      // Cleanup temp uploaded zip file if stored on disk
      if (zipFile.path && fs.existsSync(zipFile.path)) {
        try {
          fs.unlinkSync(zipFile.path);
        } catch (e) {}
      }
    } else if (imageFiles.length > 0) {
      for (const img of imageFiles) {
        const baseName = path.basename(img.originalname);
        const targetPath = path.join(framesDir, baseName);
        if (img.path && fs.existsSync(img.path)) {
          fs.copyFileSync(img.path, targetPath);
          try {
            fs.unlinkSync(img.path);
          } catch (e) {}
        } else if (img.buffer) {
          fs.writeFileSync(targetPath, img.buffer);
        }
      }
    }

    // 4. Sort and update manifest
    const frames = updateManifestFromDir(framesDir);

    return res.json({
      success: true,
      message: 'Frames successfully replaced and updated.',
      frames,
    });
  } catch (error) {
    console.error('Error uploading frames:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing uploaded frames',
    });
  }
};

/**
 * POST /api/frames/apply-workspace-zip
 * Applies any zip file existing in the root workspace (like ezgif-243cd9d6dbdd7f04-jpg.zip)
 */
export const applyWorkspaceZip = async (req, res) => {
  try {
    const workspaceRoot = path.resolve(__dirname, '../../../');
    const zipName = req.body?.zipName || 'ezgif-243cd9d6dbdd7f04-jpg.zip';
    const zipPath = path.join(workspaceRoot, zipName);

    if (!fs.existsSync(zipPath)) {
      return res.status(404).json({
        success: false,
        message: `Zip file "${zipName}" not found in workspace root.`,
      });
    }

    const framesDir = getFramesDir();
    cleanFramesDir(framesDir);

    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      if (entry.entryName.includes('__MACOSX') || path.basename(entry.entryName).startsWith('.')) {
        continue;
      }
      const ext = path.extname(entry.entryName).toLowerCase();
      if (!validExtensions.has(ext)) continue;

      const baseName = path.basename(entry.entryName);
      fs.writeFileSync(path.join(framesDir, baseName), entry.getData());
    }

    const frames = updateManifestFromDir(framesDir);

    return res.json({
      success: true,
      message: 'Frames replaced and applied from workspace zip successfully.',
      frames,
    });
  } catch (error) {
    console.error('Error applying workspace zip:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply workspace zip.',
    });
  }
};
