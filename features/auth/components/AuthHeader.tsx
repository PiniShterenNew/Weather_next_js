'use client';

import { Thermometer } from 'lucide-react';
import AuthLanguageSwitcher from './AuthLanguageSwitcher';
import AuthThemeSwitcher from './AuthThemeSwitcher';

export default function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo & App Name */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
              <Thermometer className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-white">
              Weather App
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 lg:gap-3">
            <AuthThemeSwitcher />
            <AuthLanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
