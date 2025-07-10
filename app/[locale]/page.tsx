import { Metadata } from 'next';
import HomePage from '@/components/HomePage/HomePage';


export const metadata: Metadata = {
  title: 'Weather App - Home',
  description: 'Check current weather and forecasts for cities around the world',
};

export default function Page() {
  return <HomePage />;
}