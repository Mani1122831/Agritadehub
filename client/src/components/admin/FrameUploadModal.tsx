import React from 'react';
import { X, Film } from 'lucide-react';
import { FrameUploadManager } from './FrameUploadManager';

interface FrameUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFramesUpdated?: () => void;
}

export const FrameUploadModal: React.FC<FrameUploadModalProps> = ({
  isOpen,
  onClose,
  onFramesUpdated,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Cinematic Sequence Manager
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto">
          <FrameUploadManager
            isModal={true}
            onSuccess={() => {
              if (onFramesUpdated) onFramesUpdated();
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default FrameUploadModal;
