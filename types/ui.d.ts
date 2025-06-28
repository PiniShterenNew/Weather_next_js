export type TemporaryUnit = 'metric' | 'imperial'; 
export type ThemeMode = 'light' | 'dark' | 'system';
export type Direction = 'ltr' | 'rtl';

export interface ToastMessage {
  id: number;
  message: string;
  values?: Record<string, any>;
}
