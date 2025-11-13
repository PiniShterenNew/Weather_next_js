'use client';

import React, { useState, useEffect } from 'react';
import { useSignUp, useUser } from '@clerk/nextjs';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Thermometer, Mail, Loader2 } from 'lucide-react';
import { AppLocale } from '@/types/i18n';
import { Link } from '@/i18n/navigation';
import AuthHeader from './AuthHeader';
import AuthErrorMessage from './AuthErrorMessage';
import PasswordField from './PasswordField';

export default function CustomSignUp() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const t = useTranslations('auth');
  const locale = useLocale() as AppLocale;
  
  // State declarations - must be before useEffect that uses them
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  
  // Redirect if already signed in (but not during verification flow)
  useEffect(() => {
    if (userLoaded && isSignedIn && !verifying) {
      // Use window.location to avoid React Router hook issues
      window.location.href = `/${locale}`;
    }
  }, [userLoaded, isSignedIn, locale, verifying]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    
    // Validate inputs
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setError(locale === 'he' ? 'אימייל נדרש' : 'Email is required');
      return;
    }
    
    if (!password || password.length < 8) {
      setError(locale === 'he' ? 'הסיסמה חייבת להכיל לפחות 8 תווים' : 'Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: trimmedEmail,
        password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err: unknown) {
      // Only log errors in development, not the raw error message to user
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Sign up error:', err);
      }
      
      // Handle ClerkError format
      if (err && typeof err === 'object') {
        const clerkError = err as {
          errors?: Array<{ 
            message: string; 
            long_message?: string;  // Clerk uses snake_case
            longMessage?: string;   // Fallback for camelCase
            code?: string;
            meta?: Record<string, unknown>;
          }>;
          message?: string;
          status?: number;
        };
        
        if (!clerkError.errors || clerkError.errors.length === 0) {
          setError(clerkError.message || t('signUpError'));
          return;
        }
        
        // Collect all meaningful error messages
        const errorMessages: string[] = [];
        
        for (const error of clerkError.errors) {
          const errorCode = error.code || '';
          const errorMessage = error.long_message || error.longMessage || error.message || '';
          
          if (errorCode === 'form_password_pwned') {
            errorMessages.push(locale === 'he' 
              ? 'הסיסמה שנבחרה נמצאה בפריצת נתונים. אנא בחר סיסמה אחרת.' 
              : 'Password has been found in an online data breach. Please use a different password.');
          } else if (errorCode === 'form_identifier_exists') {
            errorMessages.push(locale === 'he' 
              ? 'כתובת האימייל כבר רשומה במערכת' 
              : 'This email address is already registered');
          } else if (errorMessage) {
            errorMessages.push(errorMessage);
          }
        }
        
        // Display the most relevant error (or combine them)
        if (errorMessages.length > 0) {
          setError(errorMessages[0]); // Show the first/most important error
        } else {
          setError(t('signUpError'));
        }
      } else {
        setError(t('signUpError'));
      }
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
        // Use window.location to avoid React Router hook issues during redirect
        window.location.href = `/${locale}`;
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Verification error:', err);
      
      // Handle ClerkError format
      if (err && typeof err === 'object') {
        const clerkError = err as {
          errors?: Array<{ message: string; longMessage?: string; code?: string }>;
          message?: string;
        };
        
        const errorMessage = 
          clerkError.errors?.[0]?.longMessage || 
          clerkError.errors?.[0]?.message || 
          clerkError.message ||
          t('verificationError');
        
        setError(errorMessage);
      } else {
        setError(t('verificationError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (strategy: 'oauth_google') => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: `/${locale}/sso-callback`,
        redirectUrlComplete: `/${locale}`,
      });
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('OAuth sign up error:', err);
      
      // Handle ClerkError format
      if (err && typeof err === 'object') {
        const clerkError = err as {
          errors?: Array<{ message: string; longMessage?: string; code?: string }>;
          message?: string;
        };
        
        const errorMessage = 
          clerkError.errors?.[0]?.longMessage || 
          clerkError.errors?.[0]?.message || 
          clerkError.message ||
          t('signUpError');
        
        setError(errorMessage);
      } else {
        setError(t('signUpError'));
      }
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

          <AuthErrorMessage message={error} />

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
        <AuthErrorMessage message={error} />

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
          {/* Clerk CAPTCHA widget container */}
          <div id="clerk-captcha" className="sr-only" aria-hidden="true" />
          
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

          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            placeholder={t('passwordPlaceholder')}
            required
            disabled={isLoading}
            minLength={8}
            label={t('password')}
            showRequirements
          />

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

