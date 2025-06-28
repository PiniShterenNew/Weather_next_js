export type AppLocale = 'he' | 'en';

export interface Messages {
  [key: string]: string | Messages;
}

export type Direction = 'rtl' | 'ltr';
