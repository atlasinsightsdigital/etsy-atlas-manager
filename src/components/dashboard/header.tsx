import { SidebarTrigger } from '../ui/sidebar';
import AuthenticatedHeader from './authenticated-header';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Placeholder for potential breadcrumbs or page title */}
      </div>
      <AuthenticatedHeader />
    </header>
  );
}
