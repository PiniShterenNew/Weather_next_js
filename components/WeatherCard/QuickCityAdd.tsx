'use client';

import { Button } from '@/components/ui/button';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useTranslations, useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { TemporaryUnit } from '@/types/ui';
import { fetchWeather } from '@/features/weather';
import { POPULAR_CITIES } from '@/constants/popularCities';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { MapPin, Plus, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { getDirection } from '@/lib/intl';

export function QuickCityAdd() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'popular' | 'search'>('popular');
  const cities = useWeatherStore((s) => s.cities);
  const addCity = useWeatherStore((s) => s.addCity);
  const showToast = useWeatherStore((s) => s.showToast);
  const setIsLoading = useWeatherStore((s) => s.setIsLoading);
  const unit = useWeatherStore((s) => s.unit);
  const direction = getDirection(locale);


  const existing = new Set(cities.map((c) => `${c.lat.toFixed(2)},${c.lon.toFixed(2)}`));
  const filteredCities = POPULAR_CITIES.filter(
    (c) => !existing.has(`${c.lat.toFixed(2)},${c.lon.toFixed(2)}`)
  );

  const handleAdd = async (city: typeof POPULAR_CITIES[number]) => {
    setIsLoading(true);
    try {
      const name = t(`popular.cities.${city.id}`);
      const data = await fetchWeather({ ...city, name, unit: unit as TemporaryUnit });
      addCity(data);
      showToast({ message: 'toasts.added', values: { name } });
    } catch {
      showToast({ message: 'toasts.error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className="gap-2"
          aria-label={t('search.quickAdd')}
          title={t('search.quickAdd')}
        >
          <Plus className="h-4 w-4" />
          {t('search.quickAdd')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl h-[550px] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">{t('search.addCity')}</DialogTitle>
          <DialogDescription>{t('search.addCityDescription')}</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="popular"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'popular' | 'search')}
          className="flex flex-col h-full"
        >
          <TabsList className="mx-6 mb-2">
            <TabsTrigger value="popular" className="flex gap-2">
              <Star className="h-4 w-4" />
              {t('search.popularCities')}
            </TabsTrigger>
            <TabsTrigger value="search" className="flex gap-2">
              <MapPin className="h-4 w-4" />
              {t('search.searchCity')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="popular" className="flex-1 px-6 pb-6 m-0 flex flex-col" dir={direction}>
            <Card className="flex-1 border rounded-lg overflow-hidden">
              <div className="h-full p-3">
                <ScrollArea className="h-full p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredCities.map((city) => (
                      <Button
                        key={city.id}
                        size="sm"
                        variant="outline"
                        className={`justify-between hover:bg-primary/10 transition-colors ${direction === 'rtl' ? 'text-right' : 'text-left'
                          }`}
                        onClick={() => {
                          handleAdd(city);
                          setOpen(false);
                        }}
                      >
                        <span className="font-medium">{t(`popular.cities.${city.id}`)}</span>
                        <span className="text-xs text-muted-foreground">{city.country}</span>
                      </Button>
                    ))}
                    {filteredCities.length === 0 && (
                      <div className="col-span-2 py-8 text-center text-muted-foreground">
                        {t('search.allCitiesAdded')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="flex-1 px-6 pb-6 m-0 flex flex-col justify-start" dir={direction}>
            <div className="mb-4">
              <SearchBar onSelect={() => {
                setOpen(false);
              }} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
