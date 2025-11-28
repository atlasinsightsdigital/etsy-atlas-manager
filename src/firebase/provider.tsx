'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface FirebaseProviderProps extends FirebaseServices {
  children: ReactNode;
}

// Separate state for user authentication to prevent re-rendering service consumers
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined context state
export interface FirebaseContextState extends FirebaseServices, UserAuthState {
  areServicesAvailable: boolean;
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser extends FirebaseServices, UserAuthState {}

// Return type for useUser() - specific to user auth state
export interface UserHookResult extends UserAuthState {}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );

    return () => unsubscribe();
  }, [auth]);

  // CRITICAL FIX: The core services (app, firestore, auth) are memoized separately.
  // Their reference will NOT change when userAuthState changes.
  const services = useMemo(() => ({
    firebaseApp,
    firestore,
    auth
  }), [firebaseApp, firestore, auth]);

  // The final context value combines the stable services and the changing user state.
  const contextValue = useMemo((): FirebaseContextState => ({
    ...services,
    ...userAuthState,
    areServicesAvailable: !!(services.firebaseApp && services.firestore && services.auth),
  }), [services, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

// This hook now returns the full context state, but consumers should destructure cautiously.
const useFirebaseContext = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};


/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth, areServicesAvailable } = useFirebaseContext();
  if (!areServicesAvailable || !auth) {
    throw new Error('Auth service not available. Check FirebaseProvider props.');
  }
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore, areServicesAvailable } = useFirebaseContext();
  if (!areServicesAvailable || !firestore) {
    throw new Error('Firestore service not available. Check FirebaseProvider props.');
  }
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp, areServicesAvailable } = useFirebaseContext();
  if (!areServicesAvailable || !firebaseApp) {
    throw new Error('FirebaseApp not available. Check FirebaseProvider props.');
  }
  return firebaseApp;
};

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebaseContext();
  return { user, isUserLoading, userError };
};

/**
 * @deprecated This hook will cause re-renders on auth changes.
 * Prefer using useFirestore(), useAuth(), and useUser() separately.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useFirebaseContext();
  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }
  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};
