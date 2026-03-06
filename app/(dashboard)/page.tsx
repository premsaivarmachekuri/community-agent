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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboardStats } from '@/data/queries/actions';
import { config } from '@/lib/config';

export default function OverviewPage() {
  return (
    <>
      <Header title="Overview" description={`${config.communityName} dashboard`} />
      <div className="flex-1 space-y-6 p-6">
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards />
        </Suspense>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              See what the bot has been doing — routing questions, welcoming members, surfacing
              unanswered threads.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/activity">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="mb-1 h-9 w-12 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
