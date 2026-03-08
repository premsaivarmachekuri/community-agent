import { Sidebar } from '@/components/Sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { config } from '@/lib/config';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar communityName={config.communityName} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
