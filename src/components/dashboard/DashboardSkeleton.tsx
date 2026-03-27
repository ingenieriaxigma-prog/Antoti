/**
 * DashboardSkeleton
 * 
 * Skeleton loader específico para Dashboard
 * Muestra placeholders mientras cargan los datos
 */

import React from 'react';
import { motion } from 'framer-motion';

export function DashboardHeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800">
      {/* Month Selector */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="flex-1 text-center">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto" />
        </div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Summary Card Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Income */}
          <div className="text-center space-y-2">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
          </div>

          {/* Expenses */}
          <div className="text-center space-y-2">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
          </div>

          {/* Balance */}
          <div className="text-center space-y-2">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardTransactionsSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Filter tabs skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i}
            className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0"
          />
        ))}
      </div>

      {/* Transactions list skeleton */}
      {[1, 2, 3].map(dayIndex => (
        <motion.div
          key={dayIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: dayIndex * 0.1 }}
          className="space-y-3"
        >
          {/* Day group header */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-1.5 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>

          {/* Transaction items in group */}
          <div className="space-y-2">
            {[1, 2].map(txIndex => (
              <div
                key={txIndex}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Category emoji placeholder */}
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0" />
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-2.5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                  {/* Amount */}
                  <div className="text-right space-y-1 flex-shrink-0">
                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function TransactionsListItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
