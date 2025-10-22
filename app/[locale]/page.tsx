import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserWithCities } from '@/lib/server/user';
import { getWeatherCached } from '@/lib/server/weather';
import ClientHomePage from '@/components/HomePage/ClientHomePage';
import { Suspense } from 'react';
import CityInfoSkeleton from '@/components/skeleton/CityInfoSkeleton';

export const metadata: Metadata = {
  title: 'Weather App - Home',
  description: 'Check current weather and forecasts for cities around the world',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const { userId } = await auth();
  
  if (!userId) {
    return <ClientHomePage initialData={null} />;
  }

  const user = await getCurrentUserWithCities();
  
  if (!user || user.userCities.length === 0) {
    return <ClientHomePage initialData={{ user: user || null, cities: [], currentWeather: null, locale: locale as 'he' | 'en' }} />;
  }

  // Get first city weather
  const firstCity = user.userCities[0].city;
  const firstWeather = await getWeatherCached(
    firstCity.id,
    firstCity.lat,
    firstCity.lon,
    locale as 'he' | 'en'
  );

  // Transform user cities to client format
  const cities = user.userCities.map(uc => ({
    id: uc.city.id,
    lat: uc.city.lat,
    lon: uc.city.lon,
    name: {
      en: uc.city.cityEn,
      he: uc.city.cityHe
    },
    country: {
      en: uc.city.countryEn,
      he: uc.city.countryHe
    }
  }));

  return (
    <Suspense fallback={<CityInfoSkeleton />}>
      <ClientHomePage 
        initialData={{ 
          user, 
          cities, 
          currentWeather: firstWeather,
          locale: locale as 'he' | 'en'
        }} 
      />
    </Suspense>
  );
}