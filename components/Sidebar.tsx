'use client';

import { Suspense } from 'react';
import { Bot, LayoutDashboard, Activity, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/' as const, label: 'Overview', icon: LayoutDashboard },
  { href: '/activity' as const, label: 'Activity', icon: Activity },
  { href: '/settings' as const, label: 'Settings', icon: Settings },
];

export function Sidebar({ communityName }: { communityName: string }) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarRoot>
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold">{communityName}</span>
            <span className="block text-[11px] text-muted-foreground">Admin panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Suspense>
                <NavItems onNavigate={() => setOpenMobile(false)} />
              </Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className="mx-0" />
      <SidebarFooter>
        <SidebarMenu>
          <Suspense fallback={<UserProfileSkeleton />}>
            <UserProfile />
          </Suspense>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="sm"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = '/sign-in';
                    },
                  },
                })
              }
              tooltip="Sign out"
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarRoot>
  );
}

function NavItems({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return navItems.map((item) => {
    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} onClick={onNavigate}>
          <Link href={item.href}>
            <item.icon />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });
}

function UserProfile() {
  const { data: session } = authClient.useSession();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="cursor-default hover:bg-transparent active:bg-transparent">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-[10px] font-medium">
          {session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <span className="truncate text-xs font-medium">{session?.user?.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function UserProfileSkeleton() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="cursor-default">
        <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
