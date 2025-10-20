'use client';

import { useTranslations, useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { Star, Search } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDirection } from '@/lib/intl';

interface QuickAddModalTabsProps {
  activeTab: 'popular' | 'search';
  onTabChange: (tab: 'popular' | 'search') => void;
}

export function QuickAddModalTabs({ onTabChange }: QuickAddModalTabsProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);

  return (
    <div className="px-6 mb-6">
      <TabsList className="h-14 gap-1 p-1 bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 rounded-xl border border-muted/30 backdrop-blur-sm shrink-0" dir={direction}>
        <TabsTrigger
          value="popular"
          data-testid="tab-popular"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm 
                     data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 
                     data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20
                     data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-background/50
                     transition-all duration-200"
          onClick={() => onTabChange('popular')}
        >
          <Star className="h-4 w-4" />
          <span className="whitespace-nowrap">{t('search.popularCities')}</span>
        </TabsTrigger>

        <TabsTrigger
          value="search"
          data-testid="tab-search"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm 
                     data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 
                     data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20
                     data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-background/50
                     transition-all duration-200"
          onClick={() => onTabChange('search')}
        >
          <Search className="h-4 w-4" />
          <span className="whitespace-nowrap">{t('search.searchCity')}</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
