import React from 'react';

interface DateDividerProps {
  date: string;
}

const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  return (
    <div className="flex justify-center my-6">
      <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full shadow-sm dark:bg-gray-800 dark:text-gray-400">
        {date}
      </span>
    </div>
  );
};

export default DateDivider;