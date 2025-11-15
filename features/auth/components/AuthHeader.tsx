'use client';

import { Thermometer } from 'lucide-react';
import AuthLanguageSwitcher from './AuthLanguageSwitcher';
import AuthThemeSwitcher from './AuthThemeSwitcher';

export default function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 dark:bg-blue-700 border-b border-blue-500 dark:border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600">
              <Thermometer className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              Weather App
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <AuthThemeSwitcher />
            <AuthLanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
