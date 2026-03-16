/**
 * SkeletonLoader
 * 
 * Componente reutilizable para mostrar placeholders mientras cargan los datos.
 * Mejora la percepción de velocidad y UX.
 */

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'transaction' | 'stat' | 'circle' | 'button';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  variant = 'text', 
  count = 1,
  className = '' 
}: SkeletonLoaderProps) {
  
  const baseClasses = "bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse";

  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return <div className={`h-4 ${baseClasses} ${className}`} />;
      
      case 'card':
        return (
          <div className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full ${baseClasses}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 w-3/4 ${baseClasses}`} />
                <div className={`h-3 w-1/2 ${baseClasses}`} />
              </div>
            </div>
            <div className={`h-6 w-full ${baseClasses}`} />
          </div>
        );
      
      case 'transaction':
        return (
          <div className={`p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-12 h-12 rounded-xl ${baseClasses}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-32 ${baseClasses}`} />
                  <div className={`h-3 w-20 ${baseClasses}`} />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className={`h-5 w-24 ${baseClasses}`} />
                <div className={`h-3 w-16 ${baseClasses}`} />
              </div>
            </div>
          </div>
        );
      
      case 'stat':
        return (
          <div className={`p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg ${className}`}>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/30 rounded" />
              <div className="h-8 w-32 bg-white/40 rounded" />
              <div className="h-3 w-24 bg-white/30 rounded" />
            </div>
          </div>
        );
      
      case 'circle':
        return <div className={`rounded-full ${baseClasses} ${className}`} />;
      
      case 'button':
        return <div className={`h-10 w-full ${baseClasses} ${className}`} />;
      
      default:
        return <div className={`h-4 ${baseClasses} ${className}`} />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </>
  );
}

/**
 * Skeleton específico para Dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-white/30 rounded-lg animate-pulse" />
          <div className="h-10 w-10 bg-white/30 rounded-full animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <div className="h-4 w-24 bg-white/30 rounded animate-pulse" />
          <div className="h-10 w-48 bg-white/40 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <SkeletonLoader variant="stat" />
          <SkeletonLoader variant="stat" />
        </div>

        {/* Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <SkeletonLoader variant="transaction" count={5} />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton específico para Statistics
 */
export function StatisticsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="w-10" />
        </div>

        {/* Month/Year Selectors */}
        <div className="flex gap-2 mb-4">
          <div className="h-12 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <SkeletonLoader variant="stat" />
          <SkeletonLoader variant="stat" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Category List */}
        <SkeletonLoader variant="card" count={4} />
      </div>
    </div>
  );
}

/**
 * Skeleton específico para Transactions List
 */
export function TransactionsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/30 rounded-full animate-pulse" />
            <div className="h-8 w-32 bg-white/40 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-10 bg-white/30 rounded-full animate-pulse" />
        </div>
        
        {/* Search Bar */}
        <div className="h-12 w-full bg-white/20 rounded-xl animate-pulse" />
      </div>

      <div className="p-4 space-y-3">
        <SkeletonLoader variant="transaction" count={8} />
      </div>
    </div>
  );
}