'use client';

import React, { useState, useEffect } from 'react';
import { useSignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Thermometer, Mail, Lock, Loader2 } from 'lucide-react';
import { AppLocale } from '@/types/i18n';
import { Link } from '@/i18n/navigation';
import AuthHeader from './AuthHeader';

export default function CustomSignIn() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const t = useTranslations('auth');
  const locale = useLocale() as AppLocale;
  
  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push(`/${locale}`);
    }
  }, [userLoaded, isSignedIn, router, locale]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push(`/${locale}`);
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || t('signInError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (strategy: 'oauth_google') => {
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `/${locale}/sso-callback`,
        redirectUrlComplete: `/${locale}`,
      });
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || t('signInError'));
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 p-4 relative">
      <AuthHeader />
      
      <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl p-6 lg:p-8 xl:p-10 space-y-4 lg:space-y-6 animate-fade-in mt-20 lg:mt-24">
        {/* Logo & Title */}
        <div className="text-center space-y-3 lg:space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            <Thermometer className="h-6 w-6 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">
              {t('signIn')}
            </h1>
            <p className="text-xs lg:text-sm xl:text-base text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
              {t('loginDescription')}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-2 lg:space-y-3">
          <Button
            onClick={() => handleOAuthSignIn('oauth_google')}
            disabled={isLoading}
            className="w-full h-10 lg:h-12 xl:h-14 gap-2 lg:gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm lg:text-base"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
            ) : (
              <svg className="h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {t('signInWithGoogle')}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {t('orContinueWith')}
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3 lg:space-y-4">
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

          <div>
            <label htmlFor="password" className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="pl-9 lg:pl-10 h-10 lg:h-12 text-sm lg:text-base"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link 
              href="/forgot-password" 
              className="text-xs lg:text-sm text-brand-500 hover:text-brand-600 font-medium"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 lg:h-12 xl:h-14 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-sm lg:text-base"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin mr-2" />
                {t('signingIn')}
              </>
            ) : (
              t('signIn')
            )}
          </Button>
        </form>

        {/* Magic Link Option */}
        <div className="text-center">
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('orContinueWith')}
          </p>
          <Link
            href="/sign-in/magic-link"
            className="text-xs lg:text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            {t('sendMagicLink')} →
          </Link>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
            {t('noAccount')}{' '}
            <Link 
              href="/sign-up" 
              className="text-brand-500 hover:text-brand-600 font-medium"
            >
              {t('signUp')}
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          {t('termsAgreement')}
        </p>
      </Card>
    </div>
  );
}

