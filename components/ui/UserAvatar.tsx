'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

import { Skeleton } from './skeleton';

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

const sizePixels: Record<'sm' | 'md' | 'lg', number> = {
  sm: 32,
  md: 40,
  lg: 48,
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
      type="button"
      onClick={onClick}
      className={`${sizeClasses[size]} shrink-0 rounded-full border border-gray-300 bg-gray-100 p-0 transition-all duration-200 dark:border-white/10 dark:bg-white/10 hover:border-gray-400 dark:hover:border-white/20 ${className}`}
      aria-label="User profile"
    >
      <div className="relative h-full w-full overflow-hidden rounded-full">
        {user?.imageUrl && !imageError ? (
          <>
            {isLoading && <Skeleton className="absolute inset-0 h-full w-full rounded-full" aria-hidden="true" />}
            <img
              src={user.imageUrl}
              alt={user.fullName || 'User'}
              width={sizePixels[size]}
              height={sizePixels[size]}
              loading="lazy"
              className="h-full w-full rounded-full object-cover object-center transition-opacity duration-200"
              style={{ opacity: isLoading ? 0 : 1 }}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-900 dark:text-white font-semibold">
            {firstLetter}
          </div>
        )}
      </div>
    </button>
  );
}
