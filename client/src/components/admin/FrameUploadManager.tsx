import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FolderUp,
  FileArchive,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Film,
  Zap,
} from 'lucide-react';

interface FrameUploadManagerProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export const FrameUploadManager: React.FC<FrameUploadManagerProps> = ({
  onSuccess,
  isModal = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setStatusMessage({
      type: 'info',
      text: 'Replacing frames: deleting previous sequence and processing new frames...',
    });

    try {
      const formData = new FormData();
      const fileArray = Array.from(files);

      // Check if there is a ZIP file
      const zipFile = fileArray.find(
        (f) => f.name.endsWith('.zip') || f.type === 'application/zip' || f.type === 'application/x-zip-compressed'
      );

      if (zipFile) {
        formData.append('zipFile', zipFile);
      } else {
        // Folder or multiple image files
        const imageFiles = fileArray.filter((f) =>
          /\.(jpe?g|png|webp)$/i.test(f.name)
        );

        if (imageFiles.length === 0) {
          throw new Error('Please select a ZIP file or a folder containing images (.jpg, .png, .webp).');
        }

        imageFiles.forEach((file) => {
          formData.append('files', file);
        });
      }

      const res = await fetch('/api/frames/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to replace frames.');
      }

      setStatusMessage({
        type: 'success',
        text: 'Previous frames deleted! New cinematic sequence replaced and activated successfully.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An error occurred during upload.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleApplyWorkspaceZip = async () => {
    setUploading(true);
    setStatusMessage({
      type: 'info',
      text: 'Deleting previous frames and applying ezgif sequence from workspace...',
    });

    try {
      const res = await fetch('/api/frames/apply-workspace-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zipName: 'ezgif-243cd9d6dbdd7f04-jpg.zip' }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to apply workspace zip.');
      }

      setStatusMessage({
        type: 'success',
        text: 'Previous frames deleted! Ezgif sequence applied and active.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to apply workspace zip file.',
      });
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={`space-y-6 ${isModal ? '' : 'bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm'}`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2 border border-emerald-200">
            <Film className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cinematic Scroll Animation Sequence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Upload & Replace Scroll Frames
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            When you upload a new frames folder or archive, all previous frames are automatically deleted and replaced with the new sequence.
          </p>
        </div>

        {/* 1-Click Quick Action */}
        <button
          type="button"
          onClick={handleApplyWorkspaceZip}
          disabled={uploading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 shrink-0"
          title="Apply ezgif-243cd9d6dbdd7f04-jpg.zip detected in workspace"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 text-amber-200" />
          )}
          <span>Apply Workspace Zip (ezgif)</span>
        </button>
      </div>

      {/* Replacement Rule Notice */}
      <div className="flex items-start space-x-3 p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 text-xs">
        <Trash2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Automated Clean Replace Mechanism</p>
          <p className="text-slate-400 leading-relaxed">
            Uploading a new sequence wipes the previous frames directory on the server before extracting the new images. The cinematic scrub down animation will seamlessly rebind to the new sequence without breaking page flow.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500/60 bg-slate-50/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Drag & Drop your Frames Folder or ZIP file here
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Supports .zip archives containing frame images (like ezgif exports) or direct folders with .jpg, .png, and .webp images.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Hidden Inputs */}
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleUploadFiles(e.target.files);
                }
              }}
            />
            <input
              ref={folderInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleUploadFiles(e.target.files);
                }
              }}
            />

            {/* Upload ZIP button */}
            <button
              type="button"
              disabled={uploading}
              onClick={() => zipInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <FileArchive className="w-4 h-4" />
              <span>Select ZIP Archive</span>
            </button>

            {/* Upload Folder button */}
            <button
              type="button"
              disabled={uploading}
              onClick={() => folderInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <FolderUp className="w-4 h-4" />
              <span>Select Frames Folder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`flex items-start space-x-3 p-4 rounded-2xl text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-red-50 text-red-900 border border-red-200'
              : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : statusMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          ) : (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          )}
          <div className="font-semibold">{statusMessage.text}</div>
        </div>
      )}
    </div>
  );
};
export default FrameUploadManager;
