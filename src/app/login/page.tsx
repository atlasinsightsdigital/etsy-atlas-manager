'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { 
  GoogleAuthProvider, 
  signInWithPopup,  // CHANGED FROM signInWithRedirect
  signOut  // Add this import
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Loader2, AlertCircle } from 'lucide-react';
import { FirebaseClientProvider, useAuth, useFirestore } from '@/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';

function LoginPageContent() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browserIssue, setBrowserIssue] = useState(false);

  // Check for browser compatibility issues
  useEffect(() => {
    // Check if third-party cookies might be blocked
    const hasStorageAccess = typeof document.hasStorageAccess === 'function';
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent);
    
    if (isSafari || (isChrome && !hasStorageAccess)) {
      setBrowserIssue(true);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('User authenticated via popup:', user.email);
        
        if (!firestore) {
          console.error('Firestore not initialized');
          return;
        }

        try {
          // Create or update user document
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            console.log('Creating new user document for:', user.email);
            await setDoc(userDocRef, {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email,
              role: 'admin', // Make first user admin
              createdAt: Timestamp.now(),
              photoURL: user.photoURL || null,
              lastLogin: Timestamp.now(),
            });
            toast({
              title: 'Welcome! 🎉',
              description: 'Your account has been created successfully.',
            });
          } else {
            // Update last login time for existing user
            await setDoc(userDocRef, {
              lastLogin: Timestamp.now(),
            }, { merge: true });
          }

          // Set session token
          try {
            const token = await user.getIdToken();
            const response = await fetch('/api/auth/session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (!response.ok) {
              throw new Error('Session API failed');
            }
          } catch (sessionError) {
            console.error('Session error:', sessionError);
            // Continue anyway - client-side auth might still work
          }

          // Success! Redirect to dashboard
          toast({
            title: 'Login Successful!',
            description: 'Redirecting to dashboard...',
          });
          
          // Small delay to show success message
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
          
        } catch (error: any) {
          console.error('Firestore error:', error);
          toast({
            variant: 'destructive',
            title: 'Setup Error',
            description: 'Failed to setup user data. Please try again.',
          });
          
          // Sign out on error to clean up
          try {
            await signOut(auth);
          } catch (signOutError) {
            console.error('Sign out error:', signOutError);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router, toast]);
  

  async function handleGoogleSignIn() {
    setIsGooglePending(true);
    setError(null);
    
    if (!auth) {
      setError('Authentication not initialized');
      setIsGooglePending(false);
      return;
    }

    const provider = new GoogleAuthProvider();
    
    // Add scopes
    provider.addScope('profile');
    provider.addScope('email');
    
    // Set custom parameters if needed
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    try {
      console.log('Starting Google sign-in with popup...');
      const result = await signInWithPopup(auth, provider);
      console.log('Popup sign-in successful:', result.user.email);
      
      // The onAuthStateChanged listener above will handle the rest
      
    } catch (error: any) {
      console.error('Google sign-in error details:', error);
      
      let errorMessage = 'An error occurred during sign-in.';
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked by your browser. Please allow popups for this site.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized for Firebase authentication.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/operation-not-supported-in-this-environment':
          errorMessage = 'This browser/environment doesn\'t support popup authentication.';
          break;
        default:
          errorMessage = error.message || 'An unknown error occurred.';
      }
      
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Sign-In Failed',
        description: errorMessage,
      });
      
      // Clear any partial auth state
      try {
        if (auth.currentUser) {
          await signOut(auth);
        }
      } catch (signOutError) {
        console.error('Cleanup sign-out error:', signOutError);
      }
      
    } finally {
      setIsGooglePending(false);
    }
  }

  const handleFixBrowserIssues = () => {
    // Instructions for users
    const instructions = `
1. **Allow third-party cookies:**
   - Chrome: Settings → Privacy and Security → Cookies and other site data → Turn off "Block third-party cookies"
   - Safari: Preferences → Privacy → Turn off "Prevent cross-site tracking"
   
2. **Allow popups for this site**
   
3. **Try incognito/private mode** (often has fewer restrictions)

4. **Clear browser cache** and try again
    `;
    
    toast({
      title: 'Browser Setup Instructions',
      description: 'Please check the console for detailed instructions.',
    });
    
    console.log('📋 Browser Fix Instructions:\n', instructions);
    alert('Please check the browser console (F12) for instructions to fix authentication issues.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <div className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold">
                EA
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold">Etsy Atlas</CardTitle>
            <CardDescription className="text-lg">
              Your Etsy Business Management Platform
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {browserIssue && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your browser settings might block authentication. If login fails, try the troubleshooting steps below.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <Button 
              variant="default" 
              className="w-full h-14 text-lg font-semibold" 
              onClick={handleGoogleSignIn} 
              disabled={isGooglePending}
              size="lg"
            >
              {isGooglePending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg className="mr-3 h-6 w-6" aria-hidden="true" focusable="false" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8S109.8 11.6 244 11.6c70.3 0 129.8 27.8 173.4 71.8l-67.7 65.9c-24-23.1-55.4-37.1-90.1-37.1-68.6 0-124.7 54.3-124.7 121.2s56.1 121.2 124.7 121.2c76.7 0 108.9-52.6 112.9-79.6H244v-91.1h243.8c4.6 24.8 7.2 52.4 7.2 82.8z"></path>
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
            
            {browserIssue && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleFixBrowserIssues}
                size="sm"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Having issues? Click here
              </Button>
            )}
          </div>
          
          <div className="text-center space-y-3 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              First time? Your account will be created automatically
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>🔒 Secure Authentication</span>
              <span>•</span>
              <span>⚡ Instant Setup</span>
              <span>•</span>
              <span>📊 Full Dashboard Access</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="text-xs text-center text-muted-foreground">
            Need help? Check browser console (F12) for troubleshooting
          </p>
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