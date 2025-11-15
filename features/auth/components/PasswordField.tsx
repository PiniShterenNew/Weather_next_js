'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Eye, EyeOff, Lock, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PasswordFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  className?: string;
  label?: string;
  showRequirements?: boolean;
  error?: string;
}

/**
 * Generates a secure password that meets Clerk's requirements
 * - Minimum 8 characters
 * - Mix of uppercase, lowercase, numbers, and special characters
 */
function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + special;
  
  // Ensure at least one of each type
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly (total length: 16 characters)
  for (let i = password.length; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  minLength = 8,
  className = '',
  label,
  showRequirements = true,
  error,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showGeneratorTooltip, setShowGeneratorTooltip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations('auth');
  const locale = useLocale() as AppLocale;

  // Ensure component only renders interactive elements after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generateSecurePassword();
    onChange(newPassword);
    setShowGeneratorTooltip(true);
    setTimeout(() => setShowGeneratorTooltip(false), 3000);
  }, [onChange]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={`block text-sm lg:text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 ${locale === 'he' ? 'text-right' : 'text-left'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none z-10" aria-hidden="true" />
        <Input
          id={id}
          type={isMounted && showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-12 pl-24 h-12 lg:h-12 text-base lg:text-base border-2 ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:cursor-not-allowed transition-colors duration-150 ${className}`}
          required={required}
          disabled={disabled}
          minLength={minLength}
          autoComplete={isMounted ? 'current-password' : 'off'}
          dir="rtl"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {isMounted && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleGeneratePassword}
                    disabled={disabled}
                    className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                    aria-label={t('generatePassword') || 'Generate secure password'}
                  >
                    <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    {showGeneratorTooltip
                      ? (t('passwordGenerated') || 'Password generated! This password meets all Clerk security requirements.')
                      : (t('generatePasswordTooltip') || 'Generate a secure password that meets all Clerk security requirements')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              type="button"
              variant="ghost"
              onClick={togglePasswordVisibility}
              disabled={disabled}
              className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              aria-label={showPassword ? (t('hidePassword') || 'Hide password') : (t('showPassword') || 'Show password')}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
          </div>
        )}
      </div>
      {showRequirements && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('passwordRequirements') || 'At least 8 characters'}
        </p>
      )}
    </div>
  );
}

