import { Suspense } from 'react';
import { ArrowRight, BookOpen, ExternalLink, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { DashboardLive } from './_components/DashboardLive';
import { FormattedTime } from '@/components/FormattedTime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentActions } from '@/data/queries/actions';
import { config } from '@/lib/config';
import { typeConfig } from '@/lib/type-config';

export default function OverviewPage() {
  return (
    <>
      <Header title="Overview" description={`${config.communityName} dashboard`} />
      <div className="flex-1 space-y-6 p-6">
        <DashboardLive />
        {config.savoirApiUrl && (
          <div className="flex items-center gap-2 rounded-lg border border-info/20 bg-info/5 px-4 py-2.5 text-sm">
            <BookOpen className="h-3.5 w-3.5 text-info" />
            <span>
              Knowledge base:{' '}
              <a
                href={config.savoirApiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-info hover:underline"
              >
                {config.savoirApiUrl.replace(/^https?:\/\//, '')}
                <ExternalLink className="ml-1 inline h-3 w-3" />
              </a>
            </span>
          </div>
        )}
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
  const actions = await getRecentActions();

  const counts: Record<string, number> = { total: actions.length };
  // eslint-disable-next-line react-hooks/purity -- needed to compute "this week" from action timestamps
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek: Record<string, number> = { total: 0 };
  for (const action of actions) {
    counts[action.type] = (counts[action.type] || 0) + 1;
    if (action.timestamp >= weekAgo) {
      thisWeek[action.type] = (thisWeek[action.type] || 0) + 1;
      thisWeek.total++;
    }
  }

  const cards = [
    {
      title: 'Questions Answered',
      value: String(counts.answered || 0),
      type: 'answered' as const,
      href: '/activity?type=answered',
      weekly: thisWeek.answered || 0,
    },
    {
      title: 'Questions Routed',
      value: String(counts.routed || 0),
      type: 'routed' as const,
      href: '/activity?type=routed',
      weekly: thisWeek.routed || 0,
    },
    {
      title: 'Members Welcomed',
      value: String(counts.welcomed || 0),
      type: 'welcomed' as const,
      href: '/activity?type=welcomed',
      weekly: thisWeek.welcomed || 0,
    },
    {
      title: 'Questions Surfaced',
      value: String(counts.surfaced || 0),
      type: 'surfaced' as const,
      href: '/activity?type=surfaced',
      weekly: thisWeek.surfaced || 0,
    },
    {
      title: 'Issues Flagged',
      value: String(counts.flagged || 0),
      type: 'flagged' as const,
      href: '/activity?type=flagged',
      weekly: thisWeek.flagged || 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
      {cards.map((stat) => {
        const cfg = typeConfig[stat.type];
        return (
          <Link key={stat.title} href={stat.href as any}>
            <Card className="gap-1 py-3 transition-colors hover:bg-accent/50 sm:gap-2 sm:py-4">
              <CardHeader className="flex flex-row items-center justify-between px-3 pb-0 sm:px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {stat.title}
                </CardTitle>
                <div
                  className={`hidden h-6 w-6 items-center justify-center rounded-full sm:flex ${cfg.bgColor}`}
                >
                  <cfg.icon className={`h-3 w-3 ${cfg.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-4">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.weekly > 0 ? (
                  <p className="hidden items-center gap-1 text-xs text-success sm:flex">
                    <TrendingUp className="h-3 w-3" />+{stat.weekly} this week
                  </p>
                ) : (
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    No activity this week
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
      <Link href="/activity">
        <Card className="gap-1 py-3 transition-colors hover:bg-accent/50 sm:gap-2 sm:py-4">
          <CardHeader className="flex flex-row items-center justify-between px-3 pb-0 sm:px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              Total Actions
            </CardTitle>
            <div className="hidden h-6 w-6 items-center justify-center rounded-full bg-muted sm:flex">
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4">
            <div className="text-2xl font-bold">{String(counts.total)}</div>
            {thisWeek.total > 0 ? (
              <p className="hidden items-center gap-1 text-xs text-success sm:flex">
                <TrendingUp className="h-3 w-3" />+{thisWeek.total} this week
              </p>
            ) : (
              <p className="hidden text-xs text-muted-foreground sm:block">No activity this week</p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

async function RecentActivityCard() {
  const actions = await getRecentActions();
  const recent = actions.slice(0, 4);

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
          <div className="space-y-1">
            {recent.map((action) => {
              const cfg = typeConfig[action.type];
              const Icon = cfg.icon;
              const href =
                action.type === 'answered'
                  ? `/activity/${action.id}`
                  : `/activity?type=${action.type}`;
              return (
                <Link
                  key={action.id}
                  href={href as any}
                  className="-mx-2 flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50"
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${cfg.bgColor}`}
                  >
                    <Icon className={`h-3 w-3 ${cfg.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-foreground">{action.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.channel} &middot; <FormattedTime timestamp={action.timestamp} />
                    </p>
                  </div>
                </Link>
              );
            })}
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
      <CardContent className="space-y-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="-mx-2 flex items-start gap-3 px-2 py-2">
            <Skeleton className="mt-0.5 h-6 w-6 shrink-0 rounded-full" />
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
        <Card key={i} className="gap-2 py-4 sm:gap-2 sm:py-4">
          <CardHeader className="flex flex-row items-center justify-between px-3 pb-0 sm:px-4">
            <Skeleton className="h-3 w-16 sm:h-4 sm:w-24" />
            <Skeleton className="hidden h-6 w-6 rounded-full sm:block" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4">
            <Skeleton className="mb-2 h-7 w-10" />
            <Skeleton className="hidden h-3 w-24 sm:block" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
