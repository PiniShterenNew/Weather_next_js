'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineFallback() {
  const t = useTranslations('offline');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If online, don't show the fallback
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4 space-y-6">
      <div className="bg-muted p-6 rounded-lg w-full max-w-md flex flex-col items-center space-y-4 text-center shadow-lg">
        <WifiOff className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('message')}</p>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t('availableData')}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            {t('refresh')}
          </Button>
        </div>
      </div>
    </div>
  );
}
