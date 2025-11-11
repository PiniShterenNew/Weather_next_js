'use client';

import React, { useState, useEffect } from 'react';
import { useSignUp, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Thermometer, Mail, Lock, User, Loader2 } from 'lucide-react';
import { AppLocale } from '@/types/i18n';
import { Link } from '@/i18n/navigation';
import AuthHeader from './AuthHeader';

export default function CustomSignUp() {
  const { signUp, isLoaded, setActive } = useSignUp();
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
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || t('signUpError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push(`/${locale}`);
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || t('verificationError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (strategy: 'oauth_google') => {
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: `/${locale}/sso-callback`,
        redirectUrlComplete: `/${locale}`,
      });
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || t('signUpError'));
      setIsLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 p-4 relative">
        <AuthHeader />
        
        <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl p-6 lg:p-8 xl:p-10 space-y-4 lg:space-y-6 animate-fade-in mt-20 lg:mt-24">
          <div className="text-center space-y-3 lg:space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
              <Mail className="h-6 w-6 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">
                {t('verifyEmail')}
              </h1>
              <p className="text-xs lg:text-sm xl:text-base text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
                {t('verifyEmailDescription')}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('verificationCode')}
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="h-12 text-center text-2xl tracking-widest"
                required
                disabled={isLoading}
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {t('verifying')}
                </>
              ) : (
                t('verify')
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setVerifying(false)}
              className="text-sm text-brand-500 hover:text-brand-600 font-medium"
            >
              {t('backToSignUp')}
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
        {/* Logo & Title */}
        <div className="text-center space-y-3 lg:space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            <Thermometer className="h-6 w-6 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">
              {t('signUp')}
            </h1>
            <p className="text-xs lg:text-sm xl:text-base text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
              {t('signUpDescription')}
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
            onClick={() => handleOAuthSignUp('oauth_google')}
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
            {t('signUpWithGoogle')}
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
        <form onSubmit={handleEmailSignUp} className="space-y-3 lg:space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div>
              <label htmlFor="firstName" className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-2">
                {t('firstName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('firstNamePlaceholder')}
                  className="pl-9 lg:pl-10 h-10 lg:h-12 text-sm lg:text-base"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-2">
                {t('lastName')}
              </label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('lastNamePlaceholder')}
                className="h-10 lg:h-12 text-sm lg:text-base"
                required
                disabled={isLoading}
              />
            </div>
          </div>

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
                minLength={8}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('passwordRequirements')}
            </p>
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
                {t('signingUp')}
              </>
            ) : (
              t('signUp')
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
            {t('haveAccount')}{' '}
            <Link 
              href="/sign-in" 
              className="text-brand-500 hover:text-brand-600 font-medium"
            >
              {t('signIn')}
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

