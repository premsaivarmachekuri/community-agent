import { Suspense, ViewTransition } from 'react';
import { after } from 'next/server';
import { ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ActiveStreams } from './_components/ActiveStreams';
import { ActiveStreamsProvider } from './_components/ActiveStreamsContext';
import { ActivityCardGlow } from './_components/ActivityCardGlow';
import { ActivityFilters } from './_components/ActivityFilters';
import { ActivitySearch } from './_components/ActivitySearch';
import {
  ConversationPreviewProvider,
  ConversationPreviewToggle,
  ConversationPreviewContent,
} from './_components/ConversationPreview';
import { FormattedTime } from '@/components/FormattedTime';
import { ShowMoreButton } from './_components/ShowMoreButton';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getActionCounts, getRecentActions, getLastSeenTimestamp } from '@/data/queries/activity';
import { setLastSeen } from '@/lib/store';
import { requireSession } from '@/data/queries/auth';
import type { BotAction } from '@/lib/types';
import { typeConfig } from '@/config/type-config';
import { cn } from '@/lib/utils';

export default function ActivityPage({ searchParams }: PageProps<'/activity'>) {
  return (
    <>
      <Header title="Activity" description="Recent bot actions across your community" />
      <div className="flex-1 space-y-4 p-4">
        <ActiveStreamsProvider>
          <ActiveStreams />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Suspense
              fallback={
                <ViewTransition exit="slide-down">
                  <ActivityFiltersSkeleton />
                </ViewTransition>
              }
            >
              <ViewTransition default="none" enter="slide-up">
                <ActivityFiltersWithCounts />
              </ViewTransition>
            </Suspense>
            <Suspense fallback={<Skeleton className="h-8 w-48" />}>
              <ActivitySearch />
            </Suspense>
          </div>
          <Suspense
            fallback={
              <ViewTransition exit="slide-down">
                <ActivityListSkeleton />
              </ViewTransition>
            }
          >
            <ViewTransition default="none" enter="slide-up">
              <ActivityList searchParams={searchParams} />
            </ViewTransition>
          </Suspense>
        </ActiveStreamsProvider>
      </div>
    </>
  );
}

async function ActivityList({ searchParams }: Pick<PageProps<'/activity'>, 'searchParams'>) {
  const [{ type, q, limit: limitParam }, allActions, session, lastSeen] = await Promise.all([
    searchParams,
    getRecentActions(),
    requireSession(),
    getLastSeenTimestamp(),
  ] as const);

  let actions: BotAction[] = type
    ? allActions.filter((a: BotAction) => a.type === type)
    : [...allActions];

  const searchQuery = Array.isArray(q) ? q[0] : q;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    actions = actions.filter(
      (a: BotAction) =>
        a.description.toLowerCase().includes(query) ||
        a.channel.toLowerCase().includes(query) ||
        a.user?.toLowerCase().includes(query),
    );
  }

  const PAGE_SIZE = 20;
  const totalCount = actions.length;
  const rawLimit = Array.isArray(limitParam) ? limitParam[0] : limitParam;
  const limit = rawLimit ? Math.min(Number(rawLimit), totalCount) : PAGE_SIZE;
  const paginatedActions = actions.slice(0, limit);

  if (actions.length === 0) {
    const filterLabel = type ? typeConfig[type as BotAction['type']]?.label : null;
    const hasFilters = type || searchQuery;
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
        <h3 className="mt-3 text-base font-medium">
          {hasFilters ? 'No matching actions' : 'No activity yet'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchQuery && filterLabel
            ? `No ${filterLabel.toLowerCase()} actions matching "${searchQuery}".`
            : searchQuery
              ? `No actions matching "${searchQuery}". Try a different search term.`
              : filterLabel
                ? `No ${filterLabel.toLowerCase()} actions yet.`
                : 'Bot actions will appear here as your community agent handles messages, routes questions, and welcomes members.'}
        </p>
      </div>
    );
  }

  const userId = session.user.id;
  // eslint-disable-next-line react-hooks/purity -- after() runs post-response, not during render
  after(() => setLastSeen(userId, Date.now()));

  return (
    <div className="space-y-3">
      {paginatedActions.map((action) => {
        const config = typeConfig[action.type];
        const Icon = config.icon;
        const isNew = lastSeen > 0 && action.timestamp > lastSeen;

        const cardContent = (
          <Card className={isNew ? 'animate-new-glow' : ''}>
            <CardContent className="flex items-start gap-2.5 py-2.5 sm:gap-3 sm:py-3">
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7',
                  config.bgColor,
                )}
              >
                <Icon className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5', config.iconColor)} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm">{action.description}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <FormattedTime timestamp={action.timestamp} />
                  {action.lastUpdated && action.lastUpdated !== action.timestamp && (
                    <>
                      <span>&middot;</span>
                      <span>
                        updated <FormattedTime timestamp={action.lastUpdated} />
                      </span>
                    </>
                  )}
                  <span>&middot;</span>
                  <span>{action.channel}</span>
                </div>
                {(action.type === 'answered' || action.metadata?.permalink) && (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {action.type === 'answered' && (
                      <>
                        <ConversationPreviewToggle />
                        <Link
                          href={`/activity/${action.id}` as any}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                          Full thread
                        </Link>
                      </>
                    )}
                    {action.metadata?.permalink && (
                      <a
                        href={action.metadata.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View in Slack
                      </a>
                    )}
                  </div>
                )}
                {action.type === 'answered' && <ConversationPreviewContent />}
              </div>
            </CardContent>
          </Card>
        );

        return (
          <ViewTransition key={action.threadKey ?? action.id}>
            <ActivityCardGlow threadKey={action.threadKey}>
              {action.type === 'answered' ? (
                <ConversationPreviewProvider actionId={action.id}>
                  {cardContent}
                </ConversationPreviewProvider>
              ) : (
                cardContent
              )}
            </ActivityCardGlow>
          </ViewTransition>
        );
      })}
      <ShowMoreButton
        totalCount={totalCount}
        currentCount={paginatedActions.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}

async function ActivityFiltersWithCounts() {
  const counts = await getActionCounts();
  return <ActivityFilters counts={counts} />;
}

function ActivityFiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-1">
      {['All', 'Answered', 'Routed', 'Welcomed', 'Surfaced', 'Flagged'].map((label) => (
        <Skeleton
          key={label}
          className="h-8 rounded-md"
          style={{ width: `${label.length * 8 + 40}px` }}
        />
      ))}
    </div>
  );
}

function ActivityListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="flex items-start gap-2.5 py-2.5 sm:gap-3 sm:py-3">
            <Skeleton className="h-6 w-6 shrink-0 rounded-full sm:h-7 sm:w-7" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3.5 w-36" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
