'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Eye, EyeOff, Lock, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
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
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showGeneratorTooltip, setShowGeneratorTooltip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations('auth');

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
        <label htmlFor={id} className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400 z-10" />
        <Input
          id={id}
          type={isMounted && showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pl-9 lg:pl-10 pr-20 lg:pr-24 h-10 lg:h-12 text-sm lg:text-base ${className}`}
          required={required}
          disabled={disabled}
          minLength={minLength}
          autoComplete={isMounted ? 'new-password' : 'off'}
        />
        {isMounted && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGeneratePassword}
                    disabled={disabled}
                    className="h-7 w-7 lg:h-8 lg:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label={t('generatePassword') || 'Generate secure password'}
                  >
                    <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-500 dark:text-gray-400" />
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
              size="sm"
              onClick={togglePasswordVisibility}
              disabled={disabled}
              className="h-7 w-7 lg:h-8 lg:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={showPassword ? (t('hidePassword') || 'Hide password') : (t('showPassword') || 'Show password')}
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-500 dark:text-gray-400" />
              )}
            </Button>
          </div>
        )}
      </div>
      {showRequirements && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('passwordRequirements') || 'At least 8 characters'}
        </p>
      )}
    </div>
  );
}

