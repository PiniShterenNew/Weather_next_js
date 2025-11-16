'use client';

import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PopularCities from '@/features/search/components/quickAdd/PopularCities';
import { useLocale } from 'next-intl';
import { getDirection } from '@/lib/intl';
import { AppLocale } from '@/types/i18n';
import { useTranslations } from 'next-intl';

export default function CitiesSuggestions() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2">
          <Star className="h-5 w-5 text-brand-500" />
          {t('popular.title')}
        </h2>
        <PopularCities direction={direction} color="primary" />
      </CardContent>
    </Card>
  );
}


