'use client';

import React, { useState, useEffect } from 'react';
import { useSignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Thermometer, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { AppLocale } from '@/types/i18n';
import { Link } from '@/i18n/navigation';
import AuthHeader from './AuthHeader';
import { useWeatherStore } from '@/store/useWeatherStore';

export default function MagicLinkSignIn() {
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const t = useTranslations('auth');
  const locale = useLocale() as AppLocale;
  const showToast = useWeatherStore((s) => s.showToast);

  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push(`/${locale}`);
    }
  }, [userLoaded, isSignedIn, router, locale]);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !email) return;

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Create sign-in attempt
      const attempt = await signIn.create({
        identifier: email,
      });

      // Step 2: Check if email_link is supported
      const hasMagicLink = attempt.supportedFirstFactors?.some(
        (f) => f.strategy === 'email_link'
      );

      if (!hasMagicLink) {
        const errorMsg = t('magicLinkGoogleUser');
        setError(errorMsg);
        showToast({
          message: 'auth.magicLinkGoogleUserToast',
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      // Step 3: Find emailAddressId from supportedFirstFactors
      const emailId = attempt.supportedFirstFactors?.find(
        (f) => f.strategy === 'email_link'
      )?.emailAddressId;

      if (!emailId) {
        throw new Error('Email address ID missing');
      }

      // Step 4: Prepare first factor with emailAddressId
      await signIn.prepareFirstFactor({
        strategy: 'email_link',
        emailAddressId: emailId,
        redirectUrl: `/${locale}/sso-callback`,
      });

      setMagicLinkSent(true);
      showToast({
        message: 'auth.magicLinkSent',
        type: 'success',
      });
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ long_message?: string; message?: string }> };
      const errorMessage =
        error.errors?.[0]?.long_message ||
        error.errors?.[0]?.message ||
        t('magicLinkError');
      setError(errorMessage);
      showToast({
        message: 'auth.magicLinkError',
        type: 'error',
      });
    } finally {
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
              {t('sendMagicLink')}
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

        {/* Magic Link Sent Message */}
        {magicLinkSent && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">
              {t('magicLinkSent')}
            </p>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleMagicLink} className="space-y-3 lg:space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-2"
            >
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
                disabled={isLoading || magicLinkSent}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email || magicLinkSent}
            className="w-full h-10 lg:h-12 xl:h-14 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-sm lg:text-base"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin mr-2" />
                {t('sending')}
              </>
            ) : (
              t('sendMagicLink')
            )}
          </Button>
        </form>

        {/* Back to Sign In Link */}
        <div className="text-center space-y-2">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 text-xs lg:text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
            {t('backToSignIn')}
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

