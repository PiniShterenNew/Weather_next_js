/**
 * Auth Feature Types
 * TypeScript types for authentication feature
 */

export interface UserData {
  id: string;
  clerkId: string;
  email?: string | null;
  name?: string | null;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthStoreState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthStoreActions {
  setUser: (user: UserData | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

export interface SignInButtonsProps {
  className?: string;
}

export interface UserProfileProps {
  user: UserData;
  className?: string;
}

export interface LoginPageProps {
  redirectUrl?: string;
}

export interface ProfilePageProps {
  user: UserData;
}

