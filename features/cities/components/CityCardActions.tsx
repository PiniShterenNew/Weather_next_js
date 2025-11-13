'use client';

import type React from 'react';
import { useTranslations } from 'next-intl';
import { Navigation, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hapticButtonPress } from '@/lib/haptics';

export interface CityCardActionsProps {
  isCurrentLocation: boolean;
  isRefreshingLocation: boolean;
  onRefreshLocation: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function CityCardActions({
  isCurrentLocation,
  isRefreshingLocation,
  onRefreshLocation,
  onDelete
}: CityCardActionsProps) {
  const t = useTranslations();

  return (
    <div className="flex justify-end gap-3 flex-shrink-0">
      {/* Location Refresh Button - Only for current location */}
      {isCurrentLocation && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefreshLocation}
          disabled={isRefreshingLocation}
          className="h-10 w-10 aspect-square rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 transition-all duration-200 flex items-center justify-center p-0 mr-6 min-h-[44px] min-w-[44px]"
          title={t('cities.refreshLocation')}
          aria-label={t('cities.refreshLocation')}
        >
          {isRefreshingLocation ? (
            <RotateCcw className="h-3 w-3 animate-spin" />
          ) : (
            <Navigation className="h-3 w-3" />
          )}
        </Button>
      )}

      {/* Delete Button - Show for all cities including current location */}
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          hapticButtonPress();
          onDelete(e);
        }}
        className="h-10 w-10 aspect-square rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 transition-all duration-200 flex items-center justify-center p-0 min-h-[44px] min-w-[44px]"
        title={t('cities.deleteCity')}
        aria-label={t('cities.deleteCity')}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

