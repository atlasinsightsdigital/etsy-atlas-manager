import { redirect } from 'next/navigation';

export default function HomePage() {
  // The middleware will handle redirecting authenticated users to the dashboard.
  // Unauthenticated users will be redirected to the login page.
  redirect('/login');
}
