import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const getInitials = (user) => {
  if (!user) return "?";
  
  const name = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
  
  if (!name || typeof name !== 'string') return "?";
  
  const names = name.trim().split(' ').filter(Boolean);
  if (names.length === 0) return "?";
  
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0].substring(0, 2).toUpperCase();
};

const generateBgColor = (id) => {
  if (!id) return '#6b7280';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

export default function UserAvatar({ user, size = 'md', className = '' }) {
  if (!user) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarFallback style={{ backgroundColor: '#6b7280' }} className="text-white font-semibold">
          ?
        </AvatarFallback>
      </Avatar>
    );
  }

  const displayName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage 
        src={user.profile_image} 
        alt={displayName || 'User avatar'} 
      />
      <AvatarFallback 
        style={{ backgroundColor: generateBgColor(user.id) }}
        className="text-white font-semibold"
      >
        {getInitials(user)}
      </AvatarFallback>
    </Avatar>
  );
}