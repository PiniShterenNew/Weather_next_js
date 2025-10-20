import { Metadata } from 'next';
import SettingsPage from '@/features/settings/pages/SettingsPage';

export const metadata: Metadata = {
  title: 'Settings - Weather App',
  description: 'Manage your preferences and settings',
};

export default function Page() {
  return <SettingsPage />;
}

