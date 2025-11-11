// features/cities/components/CitiesList.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import WeatherList from './WeatherList';

const CitiesList = () => {
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        router.replace('/');
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  return (
    <div>
      <WeatherList />
    </div>
  );
};

export default CitiesList;
