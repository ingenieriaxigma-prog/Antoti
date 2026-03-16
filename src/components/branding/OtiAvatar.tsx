/**
 * OtiAvatar Component
 * 
 * Circular avatar with "O" - used in chat messages and headers
 * Uses the orange-to-pink gradient from the Oti brand
 */

import { memo } from 'react';

interface OtiAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'thinking' | 'offline';
  className?: string;
}

const sizeMap = {
  xs: { 
    container: 'w-6 h-6', 
    text: 'text-xs',
    statusDot: 'w-1.5 h-1.5 border border-white'
  },
  sm: { 
    container: 'w-8 h-8', 
    text: 'text-sm',
    statusDot: 'w-2 h-2 border-2 border-white'
  },
  md: { 
    container: 'w-10 h-10', 
    text: 'text-base',
    statusDot: 'w-2.5 h-2.5 border-2 border-white'
  },
  lg: { 
    container: 'w-14 h-14', 
    text: 'text-xl',
    statusDot: 'w-3 h-3 border-2 border-white'
  },
  xl: { 
    container: 'w-20 h-20', 
    text: 'text-3xl',
    statusDot: 'w-4 h-4 border-2 border-white'
  },
};

const statusColors = {
  online: 'bg-green-500',
  thinking: 'bg-yellow-500 animate-pulse',
  offline: 'bg-gray-400',
};

export const OtiAvatar = memo<OtiAvatarProps>(({ 
  size = 'md', 
  status,
  className = '' 
}) => {
  const { container, text, statusDot } = sizeMap[size];
  
  return (
    <div className={`relative ${className}`}>
      {/* Circular avatar with gradient */}
      <div 
        className={`${container} rounded-full flex items-center justify-center shadow-md`}
        style={{
          background: 'linear-gradient(135deg, #FF6B4A 0%, #FF1F5A 100%)'
        }}
      >
        <span className={`${text} font-bold text-white leading-none`}>O</span>
      </div>
      
      {/* Status indicator */}
      {status && (
        <div 
          className={`absolute bottom-0 right-0 rounded-full ${statusDot} ${statusColors[status]}`}
        />
      )}
    </div>
  );
});

OtiAvatar.displayName = 'OtiAvatar';
