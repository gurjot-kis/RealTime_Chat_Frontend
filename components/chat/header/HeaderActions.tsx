// components/chat/header/HeaderActions.tsx
import React from 'react';

const HeaderActions = () => {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {/* Audio Call Button */}
      <button className="flex items-center justify-center w-10 h-10 text-gray-500 transition-all duration-200 rounded-full hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 dark:text-gray-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 focus:outline-none">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>

      {/* Video Call Button */}
      <button className="flex items-center justify-center w-10 h-10 text-gray-500 transition-all duration-200 rounded-full hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 dark:text-gray-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 focus:outline-none">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-[1.5px] h-5 mx-1.5 bg-gray-200/80 dark:bg-gray-700/80 hidden sm:block rounded-full"></div>

      {/* More Options Button */}
      <button className="flex items-center justify-center w-10 h-10 text-gray-500 transition-all duration-200 rounded-full hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 focus:outline-none">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  );
};

export default HeaderActions;