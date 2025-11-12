export type TemporaryUnit = 'metric' | 'imperial'; 
export type ThemeMode = 'light' | 'dark' | 'system';
export type Direction = 'ltr' | 'rtl';

export interface ToastMessage {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  values?: Record<string, string>;
  action?: {
    label: string;
    onClick: () => void;
  };
}
