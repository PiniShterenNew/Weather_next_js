import { Metadata } from 'next';
import HomePage from '@/components/HomePage/HomePage';

/**
 * Metadata for the home page
 */
export const metadata: Metadata = {
  title: 'Weather App - Home',
  description: 'Check current weather and forecasts for cities around the world',
};

/**
 * Home page component that renders the main weather application
 * This follows Next.js app directory pattern where page components are server components
 * that import and render client components
 */
export default function Page() {
  return <HomePage />;
}