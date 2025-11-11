'use client';

import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWeatherStore } from '@/store/useWeatherStore';

import WeatherList from './WeatherList';

const OpenCitiesList = () => {
  const [open, setOpen] = useState(false);
  const { cities } = useWeatherStore();
  const t = useTranslations();

  const isActive = cities.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center py-2" aria-label={t('navigation.cities')}>
          <MapPin className={`mb-1 h-6 w-6 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} />
          <span className={`text-xs ${isActive ? 'font-medium text-blue-500' : 'text-gray-500'}`}>
            {t('navigation.cities')}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('navigation.cities')}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <WeatherList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpenCitiesList;


