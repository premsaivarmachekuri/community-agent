import { Suspense } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  MessageSquare,
  Search,
  UserPlus,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { AnalyticsChart } from './_components/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentActions } from '@/data/queries/actions';
import type { BotAction } from '@/lib/types';

const typeConfig: Record<
  BotAction['type'],
  { icon: typeof MessageSquare; label: string; color: string; bgColor: string }
> = {
  answered: {
    icon: MessageSquare,
    label: 'Answered',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  routed: {
    icon: ArrowRightLeft,
    label: 'Routed',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  welcomed: {
    icon: UserPlus,
    label: 'Welcomed',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  surfaced: {
    icon: Search,
    label: 'Surfaced',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  flagged: {
    icon: AlertTriangle,
    label: 'Flagged',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
};

export default function AnalyticsPage() {
  return (
    <>
      <Header title="Analytics" description="Activity trends and breakdown" />
      <div className="flex-1 space-y-6 p-6">
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsContent />
        </Suspense>
      </div>
    </>
  );
}

async function AnalyticsContent() {
  const actions = await getRecentActions();

  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();

  function startOfDay(ts: number) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  const todayStart = startOfDay(now);
  const earliest = actions.length > 0
    ? Math.min(...actions.map((a) => a.timestamp))
    : now;
  const earliestDayStart = startOfDay(earliest);
  const spanDays = Math.max(Math.round((todayStart - earliestDayStart) / dayMs) + 1, 2);

  type Bucket = {
    date: string;
    answered: number;
    routed: number;
    welcomed: number;
    surfaced: number;
    flagged: number;
  };
  const buckets: Bucket[] = [];

  for (let i = 0; i < spanDays; i++) {
    const d = new Date(earliestDayStart + i * dayMs);
    buckets.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      answered: 0,
      routed: 0,
      welcomed: 0,
      surfaced: 0,
      flagged: 0,
    });
  }

  const typeCounts: Record<string, number> = {};

  for (const action of actions) {
    typeCounts[action.type] = (typeCounts[action.type] || 0) + 1;

    const actionDayStart = startOfDay(action.timestamp);
    const idx = Math.round((actionDayStart - earliestDayStart) / dayMs);
    if (idx >= 0 && idx < spanDays) {
      buckets[idx][action.type]++;
    }
  }

  const sortedTypes = (Object.keys(typeConfig) as BotAction['type'][])
    .map((type) => ({
      type,
      count: typeCounts[type] || 0,
      ...typeConfig[type],
    }))
    .sort((a, b) => b.count - a.count);

  const totalActions = actions.length;

  return (
    <>
      <AnalyticsChart data={buckets} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Breakdown by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedTypes.map(({ type, count, icon: Icon, label, color, bgColor }) => {
              const pct = totalActions > 0 ? Math.round((count / totalActions) * 100) : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgColor}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <div className="min-w-[80px] text-sm font-medium">{label}</div>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            type === 'answered'
                              ? '#3b82f6'
                              : type === 'routed'
                                ? '#f97316'
                                : type === 'welcomed'
                                  ? '#22c55e'
                                  : type === 'surfaced'
                                    ? '#a855f7'
                                    : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm tabular-nums text-muted-foreground">
                    {count}
                  </div>
                  <div className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[288px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
