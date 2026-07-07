import React, { useRef } from "react";

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (files: FileList, type: "document" | "media") => void;
}

const AttachmentMenu = ({
  isOpen,
  onClose,
  onFileSelect,
}: AttachmentMenuProps) => {
  const documentInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "document" | "media",
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files, type);
    }
    e.target.value = "";
    onClose();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40" onClick={onClose}></div>}

      <div
        className={`absolute bottom-[72px] left-4 sm:left-6 z-50 w-56 py-2 bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/80 dark:border-gray-700/50 transition-all duration-300 origin-bottom-left ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-3 scale-95 pointer-events-none"
        }`}
      >
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={documentInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
          multiple
          onChange={(e) => handleFileChange(e, "document")}
        />
        <input
          type="file"
          ref={mediaInputRef}
          className="hidden"
          accept="image/*,video/*"
          multiple
          onChange={(e) => handleFileChange(e, "media")}
        />

        <div className="flex flex-col px-1">
          {/* Document Button */}
          <button
            onClick={() => documentInputRef.current?.click()}
            className="flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors w-full text-left group"
          >
            <div className="flex items-center justify-center w-10 h-10 mr-3 text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100">
                {" "}
                Document
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {" "}
                PDF, DOC, TXT
              </p>
            </div>
          </button>

          {/* Photos & Videos Button */}
          <button
            onClick={() => mediaInputRef.current?.click()}
            className="flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors w-full text-left group mt-1"
          >
            <div className="flex items-center justify-center w-10 h-10 mr-3 text-white bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100">
                Photos & Videos
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Images, MP4
              </p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default AttachmentMenu;
