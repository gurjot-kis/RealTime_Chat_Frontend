import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface PastePreviewModalProps {
  files: File[];
  onClose: () => void;
  onSend: (caption: string) => void;
  isUploading: boolean;
}

const PastePreviewModal: React.FC<PastePreviewModalProps> = ({
  files,
  onClose,
  onSend,
  isUploading,
}) => {
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setObjectUrls(urls);
    setActiveIndex(0);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Handle Send with Enter key (outside caption if needed, or inside caption)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isUploading) {
        onSend(caption);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!mounted || files.length === 0) return null;

  const currentFile = files[activeIndex];
  const currentUrl = objectUrls[activeIndex];

  const renderPreviewContent = () => {
    if (!currentFile || !currentUrl) return null;

    if (currentFile.type.startsWith("image/")) {
      return (
        <img
          src={currentUrl}
          alt={currentFile.name}
          className="max-w-full max-h-[45vh] object-contain rounded-xl shadow-md border border-slate-100 dark:border-gray-800"
        />
      );
    }

    if (currentFile.type.startsWith("video/")) {
      return (
        <video
          src={currentUrl}
          controls
          className="max-w-full max-h-[45vh] rounded-xl shadow-md border border-slate-100 dark:border-gray-800"
        />
      );
    }

    // Default Document/File UI
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-slate-150 dark:border-gray-800 shadow-sm max-w-sm w-full gap-4 text-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-2xl flex items-center justify-center text-3xl">
          📄
        </div>
        <div className="flex flex-col min-w-0 w-full">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {currentFile.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {(currentFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
    );
  };

  const modalMarkup = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/80 dark:bg-black/85 backdrop-blur-[6px] p-4 select-none animate-fadeIn"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-800/80 overflow-hidden flex flex-col animate-scaleIn max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-800/60">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400 text-lg">
              🖼️
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Preview Send ({files.length} {files.length === 1 ? "file" : "files"})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
            aria-label="Cancel paste"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Central Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-gray-950/20 min-h-[260px] overflow-y-auto relative">
          {renderPreviewContent()}
        </div>

        {/* Thumbnails Row (Only if multiple files) */}
        {files.length > 1 && (
          <div className="px-6 py-3 bg-slate-50/30 dark:bg-gray-950/10 border-t border-slate-100 dark:border-gray-800/40 flex items-center justify-center gap-2 overflow-x-auto">
            {files.map((file, idx) => {
              const isSelected = idx === activeIndex;
              const url = objectUrls[idx];
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-12 h-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-105"
                      : "border-slate-200 dark:border-gray-800 hover:border-slate-400 dark:hover:border-gray-600"
                  }`}
                >
                  {file.type.startsWith("image/") && url ? (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  ) : file.type.startsWith("video/") ? (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                      📹
                    </div>
                  ) : (
                    <div className="w-full h-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 text-xs font-bold">
                      📄
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Footer Input Area */}
        <div className="p-4 border-t border-slate-100 dark:border-gray-800/60 bg-white dark:bg-gray-900 flex items-center gap-3">
          {/* Caption Input */}
          <div className="flex-1 min-w-0 relative">
            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isUploading}
              autoFocus
              className="w-full py-2.5 px-5 text-[14.5px] rounded-full outline-none bg-gray-100/70 border border-transparent focus:border-emerald-500/30 focus:bg-white dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:focus:bg-gray-900 transition-all shadow-inner focus:shadow-sm focus:ring-[3px] focus:ring-emerald-500/10"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => onSend(caption)}
            disabled={isUploading}
            className={`w-11 h-11 rounded-full text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer ${
              isUploading
                ? "bg-slate-350 dark:bg-gray-800 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/20 active:scale-95"
            }`}
            aria-label="Send media"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
};

export default PastePreviewModal;
