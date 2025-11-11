'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';

interface BackgroundUpdateBannerProps {
  cityName: string;
  onApply: () => void;
  onDismiss: () => void;
}

export default function BackgroundUpdateBanner({ 
  cityName, 
  onApply, 
  onDismiss 
}: BackgroundUpdateBannerProps) {
  const t = useTranslations('backgroundUpdate');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-card-foreground">
              {t('title', { city: cityName })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isApplying}
            className="gap-2"
          >
            {isApplying ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {t('apply')}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
