/**
 * Auth Feature Exports
 * Central export point for auth feature
 */

// Components
export { default as SignInButtons } from './components/SignInButtons';
export { default as UserProfile } from './components/UserProfile';
export { default as CustomSignIn } from './components/CustomSignIn';
export { default as CustomSignUp } from './components/CustomSignUp';
export { default as ForgotPassword } from './components/ForgotPassword';
export { default as AuthLanguageSwitcher } from './components/AuthLanguageSwitcher';

// Pages
export { default as LoginPage } from './pages/LoginPage';
export { default as ProfilePage } from './pages/ProfilePage';

// Store
export { useAuthStore } from './store/useAuthStore';

// Services
export { saveUserPreferences } from './services/userSyncService.js';

// Types
export type {
  UserData,
  AuthStoreState,
  AuthStoreActions,
  AuthStore,
  SignInButtonsProps,
  UserProfileProps,
  LoginPageProps,
  ProfilePageProps,
} from './types';

