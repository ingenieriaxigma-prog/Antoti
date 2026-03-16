/**
 * 👥 GROUP CARD
 * 
 * Tarjeta visual para un grupo familiar.
 */

import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FamilyGroupWithMembers } from '../types/family.types';

interface GroupCardProps {
  group: FamilyGroupWithMembers;
  onClick: () => void;
}

export function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#10B981] dark:hover:border-[#10B981] hover:shadow-lg transition-all p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Emoji */}
          <div className="text-4xl">{group.emoji}</div>
          
          {/* Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
              {group.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Users className="w-3.5 h-3.5" />
              <span>
                {group.memberCount} {group.memberCount === 1 ? 'miembro' : 'miembros'}
              </span>
            </div>
          </div>
        </div>

        {/* Icono */}
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </div>
      </div>

      {/* Miembros */}
      <div className="flex items-center gap-1.5 mb-3">
        {group.members.slice(0, 5).map((member, index) => (
          <div
            key={member.id}
            className="text-xl"
            style={{
              marginLeft: index > 0 ? '-8px' : '0',
              zIndex: 5 - index,
            }}
            title={member.nickname}
          >
            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-sm">
              {member.emoji}
            </div>
          </div>
        ))}
        {group.memberCount > 5 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm -ml-2">
            +{group.memberCount - 5}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {group.currency}
        </span>
        <span className="text-xs font-medium text-[#10B981] dark:text-emerald-400">
          Ver detalles →
        </span>
      </div>
    </motion.button>
  );
}
