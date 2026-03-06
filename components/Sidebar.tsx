'use client';

import { Bot, LayoutDashboard, Activity, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';

const navItems = [
  { href: '/' as const, label: 'Overview', icon: LayoutDashboard },
  { href: '/activity' as const, label: 'Activity', icon: Activity },
];

export function Sidebar({ communityName }: { communityName: string }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-6 py-[18px]">
        <Bot className="h-6 w-6" />
        <span className="truncate text-lg font-semibold">{communityName}</span>
      </div>
      <Separator />
      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="flex items-center gap-3 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium">
          {session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 truncate text-sm">
          <p className="truncate font-medium">{session?.user?.name}</p>
        </div>
        <button
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = '/sign-in';
                },
              },
            })
          }
          className="rounded-md p-1.5 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
