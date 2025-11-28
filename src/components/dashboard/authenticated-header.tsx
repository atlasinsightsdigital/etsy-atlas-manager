'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from '@/firebase';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthenticatedHeader() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const formattedDate = currentDateTime ? format(currentDateTime, 'eeee, MMMM do, yyyy') : '...';
  const formattedTime = currentDateTime ? format(currentDateTime, 'HH:mm:ss') : '...';
  
  const handleSignOut = async () => {
    try {
      // Clear the session cookie by calling the API
      await fetch('/api/auth/session', { method: 'DELETE' });
      // This will trigger a redirect via middleware because the 'session' cookie is gone
      router.push('/login');
      router.refresh(); // Ensure the page reloads and middleware runs
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex w-full items-center justify-end gap-4 text-sm">
      <div className="text-right">
        <p className="font-semibold text-foreground">Hi, {user ? user.email : '...'}</p>
        <p className="text-muted-foreground">{formattedDate}</p>
      </div>
      <div className="text-lg font-mono tracking-tighter rounded-md bg-muted px-2 py-1 min-w-[80px] text-center">
        {formattedTime}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photoURL || ''} alt="User avatar" />
              <AvatarFallback>{isUserLoading ? '...' : userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {isUserLoading ? 'Loading...' : user?.displayName || user?.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {isUserLoading ? '' : 'Administrator'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
