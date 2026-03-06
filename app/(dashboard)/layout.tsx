import { Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { config } from '@/lib/config';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense>
        <Sidebar communityName={config.communityName} />
      </Suspense>
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}
