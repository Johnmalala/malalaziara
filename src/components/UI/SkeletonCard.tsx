import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
