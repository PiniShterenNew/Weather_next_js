/**
 * App version utility
 * Reads version from environment variable set during build
 */

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';

export const getAppVersion = (): string => {
  return APP_VERSION;
};

export const getVersionInfo = () => {
  return {
    version: APP_VERSION,
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };
};
