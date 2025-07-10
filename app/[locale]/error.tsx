'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex flex-col items-center max-w-md">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
        <p className="text-muted-foreground mb-6">{t('description')}</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={reset} 
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            {t('tryAgain')}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/')} 
          >
            {t('goHome')}
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-muted/50 rounded-md text-left w-full overflow-auto">
            <p className="text-xs text-muted-foreground break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
