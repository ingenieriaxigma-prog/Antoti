/**
 * 🔔 NOTIFICATION BADGE
 * 
 * Badge para mostrar contador de notificaciones no leídas.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface NotificationBadgeProps {
  count: number;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
    >
      {displayCount}
    </motion.div>
  );
}
