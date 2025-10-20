'use client';

import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { getDirection } from '@/lib/intl';
import PopularCities from './PopularCities';
import { SearchBar } from '@/features/search';
import AddLocation from './AddLocation';
import { useWeatherStore } from '@/store/useWeatherStore';
import { QuickAddModalHeader } from './QuickAddModalHeader';
import { QuickAddModalTabs } from './QuickAddModalTabs';

export function QuickAddModalContent() {
  const locale = useLocale() as AppLocale;
  const { setOpen } = useWeatherStore();
  const [activeTab, setActiveTab] = useState<'popular' | 'search'>('popular');
  const direction = getDirection(locale);

  return (
    <div className="w-full max-w-4xl max-h-[90vh] min-h-[600px] p-0 overflow-hidden flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <QuickAddModalHeader />

      <Tabs
        defaultValue="popular"
        value={activeTab}
        role='tablist'
        onValueChange={(value) => setActiveTab(value as 'popular' | 'search')}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <QuickAddModalTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Current Location Button */}
        <div className="px-6 mb-4">
          <AddLocation 
            type="default" 
            size="lg" 
            dataTestid="add-location-modal"
          />
        </div>

        <TabsContent
          value="popular"
          className="flex-1 px-6 pb-6 m-0 flex flex-col overflow-hidden"
          dir={direction}
        >
          <Card className="flex-1 border border-border/50 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <div className="h-full overflow-y-auto p-4">
              <PopularCities direction={direction} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent
          value="search"
          className="flex-1 px-6 pb-6 m-0 flex flex-col justify-start overflow-hidden"
          dir={direction}
        >
          <div className="mb-4 shrink-0">
            <SearchBar onSelect={() => {
              setOpen(false);
            }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
