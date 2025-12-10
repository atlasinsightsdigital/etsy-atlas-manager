import { DashboardSidebar as Sidebar } from '@/components/dashboard/sidebar';
import { AuthenticatedHeader } from '@/components/dashboard/authenticated-header';
import { ErrorBoundary } from '@/components/error-boundary';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedHeader />
      <div className="flex-1 flex">
        <div className="w-64"> {/* Fixed width for sidebar */}
          <Sidebar />
        </div>
        <main className="flex-1 p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}