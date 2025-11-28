'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Helper function to get cookie by name
function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export default function AuthenticatedHeader() {
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Set the initial date/time on the client
    setCurrentDateTime(new Date());

    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    const sessionCookie = getCookie('session');
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
        setUserName(sessionData.name);
      } catch (error) {
        console.error('Failed to parse session cookie:', error);
      }
    }

    return () => {
      clearInterval(timer);
    };
  }, []);
  
  const formattedDate = currentDateTime ? format(currentDateTime, 'eeee, MMMM do, yyyy') : '...';
  const formattedTime = currentDateTime ? format(currentDateTime, 'HH:mm:ss') : '...';

  return (
    <div className="flex w-full items-center justify-end gap-4 text-sm">
        <div className="text-right">
            {userName && <p className="font-semibold text-foreground">Hi, {userName}</p>}
            <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="text-lg font-mono tracking-tighter rounded-md bg-muted px-2 py-1 min-w-[80px] text-center">
            {formattedTime}
        </div>
    </div>
  );
}
