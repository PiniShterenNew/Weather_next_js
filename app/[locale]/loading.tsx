import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Loading component for the locale-specific routes
 * Displays when the page or its children are loading
 * Provides a visual indicator that content is being loaded
 */
export default function LocaleLoading() {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg animate-pulse">
          {t('loading')}
        </p>
      </div>
    </div>
  );
}
