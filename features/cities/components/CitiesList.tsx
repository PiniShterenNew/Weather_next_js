// features/cities/components/CitiesList.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WeatherList from '@/components/CitiesList/Weatherlist';

const CitiesList = () => {
    const router = useRouter();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                router.replace('/');
            }
        };

        handleResize(); // קריאה מיידית

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [router]);

    return (
        <div className="">
            <WeatherList />
        </div>
    );
};

export default CitiesList;
