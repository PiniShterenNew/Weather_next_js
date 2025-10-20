'use client';

import { UserButton } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import type { UserProfileProps } from '../types';

export default function UserProfile({ user, className = '' }: UserProfileProps) {
  const t = useTranslations('auth');

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex flex-col items-end">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {user.name || t('user')}
        </p>
        {user.email && (
          <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
        )}
      </div>
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'h-10 w-10',
          },
        }}
      />
    </div>
  );
}

