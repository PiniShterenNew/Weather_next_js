'use client';

import { useUserSync } from '@/hooks/useUserSync';

/**
 * AuthSync Component
 * Client component that handles automatic user sync with Clerk
 * Place in layout to enable auth sync across the app
 */
export default function AuthSync() {
  useUserSync();
  return null;
}

