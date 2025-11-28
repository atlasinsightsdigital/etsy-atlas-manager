import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex w-full max-w-md flex-col items-center space-y-4 text-center">
        <div className="flex items-center gap-3 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            className="h-10 w-10"
            >
            <rect width="256" height="256" fill="none" />
            <path
                d="M32,184.2,125.7,56.9a8,8,0,0,1,12.6,0L224,184.2a8.1,8.1,0,0,1-6.3,12.3H38.3A8.1,8.1,0,0,1,32,184.2Z"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="16"
            />
            <line
                x1="128"
                y1="216"
                x2="128"
                y2="24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="16"
            />
          </svg>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Etsy Atlas Manager</h1>
        </div>
        <p className="text-muted-foreground">The all-in-one solution for managing your Etsy business.</p>
      </div>
      <LoginForm />
    </main>
  );
}
