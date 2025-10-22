'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export default function UserAvatar({ 
  size = 'md', 
  className = '', 
  onClick 
}: UserAvatarProps) {
  const { user } = useUser();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get first letter of name for fallback
  const firstLetter = user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setIsLoading(false);
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full overflow-hidden border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 p-0 transition-all duration-200 bg-gray-100 dark:bg-white/10 shrink-0 ${className}`}
      aria-label="User profile"
    >
      {user?.imageUrl && !imageError ? (
        <>
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center text-gray-900 dark:text-white font-semibold">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
            </div>
          )}
          <img
            src={user.imageUrl}
            alt={user.fullName || 'User'}
            className={`w-full h-full object-cover object-center rounded-full ${isLoading ? 'hidden' : 'block'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-900 dark:text-white font-semibold">
          {firstLetter}
        </div>
      )}
    </button>
  );
}
