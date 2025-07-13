'use client';

import dynamic from 'next/dynamic';

// Dynamically import OfflineFallback for client-side only rendering
const OfflineFallback = dynamic(() => import('@/components/OfflineFallback/OfflineFallback'), {
    ssr: false,
});

export default OfflineFallback;