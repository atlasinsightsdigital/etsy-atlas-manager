'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, getRedirectResult, User } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { FirebaseClientProvider, useAuth, useFirestore } from '@/firebase';

function LoginPageContent() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !firestore) return;

    // Handle the redirect result from Google Sign-In
    getRedirectResult(auth)
      .then(async (result) => {
        setIsGooglePending(false); // Stop loading indicator after redirect
        if (result && result.user) {
          // User successfully signed in. The onAuthStateChanged listener will handle the rest.
        }
      })
      .catch((error) => {
        // Handle Errors here.
        const errorMessage = error.message || 'An unknown error occurred during Google Sign-In.';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: errorMessage,
        });
        setIsGooglePending(false);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!firestore) return;

        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            id: user.uid,
            name: user.displayName || user.email,
            email: user.email,
            role: 'user',
            createdAt: Timestamp.now(),
          });
        }

        try {
          const token = await user.getIdToken();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          router.push('/dashboard');
        } catch (sessionError) {
          console.error('Failed to set session:', sessionError);
          setError('Failed to create a session. Please try again.');
        }
      } else {
        // Not signed in, not loading anymore
        setIsGooglePending(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router, toast]);
  

  async function handleGoogleSignIn() {
    setIsGooglePending(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      // Use signInWithRedirect instead of signInWithPopup
      await signInWithRedirect(auth, provider);
      // The page will redirect, and the logic in useEffect will handle the result
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred during Google Sign-In.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: errorMessage,
      });
      setIsGooglePending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Etsy Atlas</CardTitle>
          <CardDescription>
            Sign in with your Google account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGooglePending}>
                {isGooglePending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8S109.8 11.6 244 11.6c70.3 0 129.8 27.8 173.4 71.8l-67.7 65.9c-24-23.1-55.4-37.1-90.1-37.1-68.6 0-124.7 54.3-124.7 121.2s56.1 121.2 124.7 121.2c76.7 0 108.9-52.6 112.9-79.6H244v-91.1h243.8c4.6 24.8 7.2 52.4 7.2 82.8z"></path>
                    </svg>
                )}
                Sign In with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          {error && <p className="w-full text-center text-sm text-destructive">{error}</p>}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
    return (
        <FirebaseClientProvider>
            <LoginPageContent />
        </FirebaseClientProvider>
    );
}
