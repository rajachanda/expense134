import { motion } from 'framer-motion';

const SkeletonLoader = ({ className = '', rows = 1, height = 'h-4' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`skeleton ${height} w-full`}></div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
      </div>
      <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <SkeletonLoader height="h-4" className="w-20" />
        <div className="mt-2">
          <SkeletonLoader height="h-8" className="w-24" />
        </div>
      </div>
      <SkeletonLoader height="h-8 w-8 rounded-lg" />
    </div>
  </div>
);

export const ExpenseItemSkeleton = () => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse">
    <div className="flex items-center space-x-3 flex-1">
      <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
        <div className="flex items-center space-x-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
      </div>
    </div>
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
);

export default SkeletonLoader;
