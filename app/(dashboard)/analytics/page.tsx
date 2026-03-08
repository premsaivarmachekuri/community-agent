import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { AnalyticsChart } from './_components/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnalyticsData } from '@/data/queries/activity';
import type { BotAction } from '@/lib/types';
import { typeConfig } from '@/config/type-config';

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
  const { buckets, typeCounts, totalActions } = await getAnalyticsData();

  const sortedTypes = (Object.keys(typeConfig) as BotAction['type'][])
    .map((type) => ({
      type,
      count: typeCounts[type] || 0,
      ...typeConfig[type],
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <AnalyticsChart data={buckets} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Breakdown by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedTypes.map(({ type, count, icon: Icon, label, iconColor, bgColor }) => {
              const pct = totalActions > 0 ? Math.round((count / totalActions) * 100) : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgColor}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                  </div>
                  <div className="min-w-[80px] text-sm font-medium">{label}</div>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: `var(--type-${type})`,
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
