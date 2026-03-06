import { Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { config } from '@/lib/config';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Suspense>
        <Sidebar communityName={config.communityName} />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
