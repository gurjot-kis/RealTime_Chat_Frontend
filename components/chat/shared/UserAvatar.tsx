// components/chat/shared/UserAvatar.tsx
import React from 'react';
import OnlineBadge from './OnlineBadge';

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name, 
  imageUrl, 
  isOnline = false, 
  size = 'md' 
}) => {
  // Map sizes to Tailwind classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-lg',
  };

  const badgeSizeClasses = {
    sm: 'absolute bottom-0 right-0 w-2.5 h-2.5',
    md: 'absolute bottom-0 right-0 w-3 h-3',
    lg: 'absolute bottom-0 right-0 w-3.5 h-3.5',
  };

  const getMediaUrl = (url?: string) => {
    if (!url) return "";
    if (
      url.startsWith("http://") || 
      url.startsWith("https://") || 
      url.startsWith("data:") || 
      url.startsWith("blob:")
    ) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="relative inline-block flex-shrink-0">
      {/* Avatar Image or Initial Fallback */}
      {imageUrl ? (
        <img
          src={getMediaUrl(imageUrl)}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border border-gray-100 dark:border-gray-800`}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold uppercase tracking-wider`}>
          {name.charAt(0)}
        </div>
      )}

      {/* Online Status Badge */}
      <OnlineBadge 
        isOnline={isOnline} 
        className={badgeSizeClasses[size]} 
      />
    </div>
  );
};

export default UserAvatar;