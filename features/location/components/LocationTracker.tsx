'use client';

import { useLocationTracker } from '@/hooks/useLocationTracker';
import LocationChangeDialog from './LocationChangeDialog';

export default function LocationTracker() {
  // Initialize location tracking
  useLocationTracker();

  return <LocationChangeDialog />;
}
