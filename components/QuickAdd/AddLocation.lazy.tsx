'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';

const AddLocationLazy = dynamic(() => import('./AddLocation').then((module) => module.default), {
  loading: () => (
    <Skeleton className="h-10 w-full" />
  ),
});

export default AddLocationLazy;
