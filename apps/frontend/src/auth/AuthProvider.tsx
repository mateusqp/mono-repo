import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { User } from 'oidc-client-ts';
import { createUserManager } from './oidcClient.ts';
import { useAppConfig } from '../config/ConfigContext.tsx';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signInSilently: () => Promise<void>;
  completeSignIn: () => Promise<void>;
  completeSilentSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const config = useAppConfig();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userManager = useMemo(() => createUserManager(config), [config]);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const existingUser = await userManager.getUser();
        if (isMounted) {
          setUser(existingUser);
        }
      } catch (error) {
        console.error('Failed to restore OIDC session', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const handleUserLoaded = (loadedUser: User) => {
      setUser(loadedUser);
    };

    const handleUserUnloaded = () => {
      setUser(null);
    };

    const handleAccessTokenExpiring = async () => {
      try {
        await userManager.signinSilent();
      } catch (error) {
        console.warn('Automatic silent renew failed', error);
        setUser(null);
      }
    };

    const handleAccessTokenExpired = async () => {
      try {
        await userManager.signinSilent();
      } catch (error) {
        console.warn('Automatic silent renew failed', error);
        setUser(null);
      }
    };

    const handleSilentRenewError = (error: unknown) => {
      console.error('Silent renew experienced an error', error);
      setUser(null);
    };

    void loadUser();

    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);
    userManager.events.addAccessTokenExpiring(handleAccessTokenExpiring);
    userManager.events.addAccessTokenExpired(handleAccessTokenExpired);
    userManager.events.addSilentRenewError(handleSilentRenewError);

    return () => {
      isMounted = false;
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeAccessTokenExpiring(handleAccessTokenExpiring);
      userManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
    };
  }, [userManager]);

  const signIn = useCallback(async () => {
    await userManager.signinRedirect();
  }, [userManager]);

  const signOut = useCallback(async () => {
    await userManager.signoutRedirect();
  }, [userManager]);

  const signInSilently = useCallback(async () => {
    await userManager.signinSilent();
  }, [userManager]);

  const completeSignIn = useCallback(async () => {
    await userManager.signinCallback();
  }, [userManager]);

  const completeSilentSignIn = useCallback(async () => {
    await userManager.signinSilentCallback();
  }, [userManager]);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && !user.expired),
      isLoading,
      signIn,
      signOut,
      signInSilently,
      completeSignIn,
      completeSilentSignIn
    }),
    [completeSignIn, completeSilentSignIn, isLoading, signIn, signInSilently, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
