'use client';

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Thermometer, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import AuthHeader from './AuthHeader';
import AuthErrorMessage from './AuthErrorMessage';
import PasswordField from './PasswordField';

export default function ForgotPassword() {
  const { signIn, isLoaded } = useSignIn();
  const t = useTranslations('auth');
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStep('code');
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || t('resetPasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError('');

    try {
      await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      setStep('success');
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || t('resetPasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 p-4 relative">
        <AuthHeader />
        
        <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl p-6 lg:p-8 xl:p-10 space-y-4 lg:space-y-6 animate-fade-in text-center mt-20 lg:mt-24">
          <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-green-100 dark:bg-green-900 mx-auto">
            <svg className="h-6 w-6 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">
              {t('passwordResetSuccess')}
            </h1>
            <p className="text-xs lg:text-sm xl:text-base text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
              {t('passwordResetSuccessDescription')}
            </p>
          </div>

          <Link href="/sign-in">
            <Button className="w-full h-10 lg:h-12 xl:h-14 bg-gradient-to-r from-brand-500 to-brand-600 text-sm lg:text-base">
              {t('backToSignIn')}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 p-4 relative">
        <AuthHeader />
        
        <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl p-6 lg:p-8 xl:p-10 space-y-4 lg:space-y-6 animate-fade-in mt-20 lg:mt-24">
          <div className="text-center space-y-3 lg:space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
              <Lock className="h-6 w-6 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">
                {t('resetPassword')}
              </h1>
              <p className="text-xs lg:text-sm xl:text-base text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
                {t('enterCodeAndNewPassword')}
              </p>
            </div>
          </div>

          <AuthErrorMessage message={error} />

          <form onSubmit={handleResetPassword} className="space-y-3 lg:space-y-4">
            <div>
              <label htmlFor="code" className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-2">
                {t('verificationCode')}
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="h-10 lg:h-12 text-center text-lg lg:text-2xl tracking-widest"
                required
                disabled={isLoading}
                maxLength={6}
              />
            </div>

            <PasswordField
              id="password"
              value={password}
              onChange={setPassword}
              placeholder={t('passwordPlaceholder')}
              required
              disabled={isLoading}
              minLength={8}
              label={t('newPassword')}
              showRequirements
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 lg:h-12 xl:h-14 bg-gradient-to-r from-brand-500 to-brand-600 text-sm lg:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin mr-2" />
                  {t('resetting')}
                </>
              ) : (
                t('resetPassword')
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setStep('email')}
              className="text-sm text-brand-500 hover:text-brand-600 font-medium inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToEmail')}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 p-4 relative">
      <AuthHeader />
      
      <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl p-6 lg:p-8 xl:p-10 space-y-4 lg:space-y-6 animate-fade-in mt-20 lg:mt-24">
        <div className="text-center space-y-3 lg:space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            <Thermometer className="h-6 w-6 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">
              {t('forgotPassword')}
            </h1>
            <p className="text-xs lg:text-sm xl:text-base text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
              {t('forgotPasswordDescription')}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSendCode} className="space-y-3 lg:space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-2">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="pl-9 lg:pl-10 h-10 lg:h-12 text-sm lg:text-base"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 lg:h-12 xl:h-14 bg-gradient-to-r from-brand-500 to-brand-600 text-sm lg:text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin mr-2" />
                {t('sending')}
              </>
            ) : (
              t('sendResetCode')
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link 
            href="/sign-in" 
            className="text-xs lg:text-sm text-brand-500 hover:text-brand-600 font-medium inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToSignIn')}
          </Link>
        </div>
      </Card>
    </div>
  );
}

