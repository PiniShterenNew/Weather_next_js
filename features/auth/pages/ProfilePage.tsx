'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@clerk/nextjs';
import { LogOut, Mail, User as UserIcon } from 'lucide-react';
import type { ProfilePageProps } from '../types';

export default function ProfilePage({ user }: ProfilePageProps) {
  const t = useTranslations();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('auth.profile')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('auth.profileDescription')}
        </p>
      </div>

      {/* User Info Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.name')}
            </p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {user.name || t('auth.notProvided')}
            </p>
          </div>
        </div>

        {user.email && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.email')}
              </p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Sign Out Button */}
      <SignOutButton>
        <Button
          variant="outline"
          className="w-full gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
        >
          <LogOut className="h-4 w-4" />
          {t('auth.signOut')}
        </Button>
      </SignOutButton>
    </div>
  );
}

