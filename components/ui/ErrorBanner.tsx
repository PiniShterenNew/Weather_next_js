'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBannerProps {
  type: 'geolocation-denied' | 'geolocation-timeout' | 'api-failure' | 'server-data';
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorBanner({ 
  type, 
  onRetry, 
  onDismiss 
}: ErrorBannerProps) {
  const t = useTranslations('errorBanner');

  const getIcon = () => {
    switch (type) {
      case 'geolocation-denied':
      case 'geolocation-timeout':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'api-failure':
        return <WifiOff className="h-5 w-5 text-destructive" />;
      case 'server-data':
        return <Wifi className="h-5 w-5 text-info" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-warning" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'geolocation-denied':
        return t('geolocationDenied');
      case 'geolocation-timeout':
        return t('geolocationTimeout');
      case 'api-failure':
        return t('apiFailure');
      case 'server-data':
        return t('serverData');
      default:
        return t('unknown');
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <p className="font-medium text-card-foreground">
              {getMessage()}
            </p>
            {type === 'server-data' && (
              <p className="text-sm text-muted-foreground">
                {t('serverDataDescription')}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onRetry && (
            <Button
              size="sm"
              onClick={onRetry}
              variant="outline"
            >
              {t('retry')}
            </Button>
          )}
          
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
