import { Suspense } from 'react';
import {
  MessageSquare,
  UserPlus,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { DashboardLive } from '@/components/DashboardLive';
import { FormattedTime } from '@/components/FormattedTime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardStats, getRecentActions } from '@/data/queries/actions';
import { config } from '@/lib/config';

export default function OverviewPage() {
  return (
    <>
      <Header title="Overview" description={`${config.communityName} dashboard`} />
      <div className="flex-1 space-y-6 p-6">
        <DashboardLive />
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards />
        </Suspense>
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivityCard />
        </Suspense>
      </div>
    </>
  );
}

async function StatsCards() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: 'Questions Answered',
      value: String(stats.answered),
      description: 'Community questions handled',
      icon: MessageSquare,
    },
    {
      title: 'Questions Routed',
      value: String(stats.routed),
      description: 'Directed to the right channel',
      icon: ArrowRightLeft,
    },
    {
      title: 'Members Welcomed',
      value: String(stats.welcomed),
      description: 'New members greeted',
      icon: UserPlus,
    },
    {
      title: 'Questions Surfaced',
      value: String(stats.surfaced),
      description: 'Unanswered threads found',
      icon: HelpCircle,
    },
    {
      title: 'Issues Flagged',
      value: String(stats.flagged),
      description: 'Escalated to community lead',
      icon: AlertTriangle,
    },
    {
      title: 'Total Actions',
      value: String(stats.total),
      description: 'All bot interactions',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
      {cards.map((stat) => (
        <Card key={stat.title} className="gap-2 py-3 sm:gap-6 sm:py-6">
          <CardHeader className="flex flex-row items-center justify-between px-3 pb-0 sm:px-6 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              {stat.title}
            </CardTitle>
            <stat.icon className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-2xl font-bold sm:text-3xl">{stat.value}</div>
            <p className="hidden text-xs text-muted-foreground sm:block">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RecentActivityCard() {
  const actions = await getRecentActions();
  const recent = actions.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/activity">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No activity yet — stats will appear as the bot handles messages.
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((action) => (
              <div key={action.id} className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/30" />
                <div className="flex-1 text-sm">
                  <p className="text-foreground">{action.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.channel} &middot; <FormattedTime timestamp={action.timestamp} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-20" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="mt-1 h-2 w-2 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="gap-2 py-3 sm:gap-6 sm:py-6">
          <CardHeader className="flex flex-row items-center justify-between px-3 pb-0 sm:px-6 sm:pb-2">
            <Skeleton className="h-3 w-16 sm:h-4 sm:w-24" />
            <Skeleton className="hidden h-4 w-4 sm:block" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <Skeleton className="mb-1 h-7 w-10 sm:h-9 sm:w-12" />
            <Skeleton className="hidden h-4 w-32 sm:block" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
