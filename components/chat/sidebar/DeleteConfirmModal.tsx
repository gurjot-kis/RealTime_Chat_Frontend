"use client";

import React from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content Card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800/80 shadow-2xl p-6 animate-scaleIn transition-colors duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Warning Icon Banner */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 mb-4 animate-bounce-slow">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          <h3 className="text-base font-bold text-slate-800 dark:text-gray-100 mb-2">
            Delete Conversation
          </h3>
          
          <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mb-6">
           Are you sure you want to delete your conversation with <span className="font-semibold text-slate-700 dark:text-gray-200">{title}</span> from your sidebar?
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-end w-full gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-slate-700 dark:hover:text-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center"
            >
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1.5" />
              ) : null}
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
