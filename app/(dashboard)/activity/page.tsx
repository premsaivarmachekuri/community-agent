import { Suspense } from 'react';
import { headers } from 'next/headers';
import { after } from 'next/server';
import {
  AlertTriangle,
  ArrowRightLeft,
  ExternalLink,
  MessageSquare,
  Search,
  UserPlus,
} from 'lucide-react';
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
import { getRecentActions } from '@/data/queries/actions';
import { auth } from '@/lib/auth';
import { getLastSeen, setLastSeen } from '@/lib/store';
import type { BotAction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ViewTransition } from 'react';

const typeConfig: Record<
  BotAction['type'],
  {
    icon: typeof ArrowRightLeft;
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    iconColor: string;
    bgColor: string;
  }
> = {
  routed: {
    icon: ArrowRightLeft,
    label: 'Routed',
    variant: 'outline',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  welcomed: {
    icon: UserPlus,
    label: 'Welcomed',
    variant: 'secondary',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  surfaced: {
    icon: Search,
    label: 'Surfaced',
    variant: 'outline',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  answered: {
    icon: MessageSquare,
    label: 'Answered',
    variant: 'default',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  flagged: {
    icon: AlertTriangle,
    label: 'Flagged',
    variant: 'destructive',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
};

export default function ActivityPage({ searchParams }: PageProps<'/activity'>) {
  return (
    <>
      <Header title="Activity" description="Recent bot actions across your community" />
      <div className="flex-1 space-y-4 p-6">
        <ActiveStreamsProvider>
          <ActiveStreams />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Suspense fallback={<ActivityFiltersSkeleton />}>
              <ActivityFiltersWithCounts />
            </Suspense>
            <Suspense>
              <ActivitySearch />
            </Suspense>
          </div>
          <Suspense fallback={<ActivityListSkeleton />}>
            <ActivityList searchParams={searchParams} />
          </Suspense>
        </ActiveStreamsProvider>
      </div>
    </>
  );
}

async function ActivityList({ searchParams }: Pick<PageProps<'/activity'>, 'searchParams'>) {
  const [{ type, q, limit: limitParam }, allActions, session] = await Promise.all([
    searchParams,
    getRecentActions(),
    auth.api.getSession({ headers: await headers() }).catch(() => {
      return null;
    }),
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

  let lastSeen = 0;
  if (session?.user?.id) {
    lastSeen = await getLastSeen(session.user.id);
  }

  if (actions.length === 0) {
    const filterLabel = type ? typeConfig[type as BotAction['type']]?.label : null;
    const hasFilters = type || searchQuery;
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">
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

  if (session?.user?.id) {
    const userId = session.user.id;
    // eslint-disable-next-line react-hooks/purity -- after() runs post-response, not during render
    after(() => setLastSeen(userId, Date.now()));
  }

  return (
    <div className="space-y-3">
      {paginatedActions.map((action) => {
        const config = typeConfig[action.type];
        const Icon = config.icon;
        const isNew = lastSeen > 0 && action.timestamp > lastSeen;

        const cardContent = (
          <Card className={isNew ? 'animate-new-glow' : ''}>
            <CardContent className="flex items-start gap-3 py-3 sm:gap-4 sm:py-4">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9',
                  config.bgColor,
                )}
              >
                <Icon className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', config.iconColor)} />
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
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
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
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
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
  const actions = await getRecentActions();
  const counts: Record<string, number> = { all: actions.length };
  for (const action of actions) {
    counts[action.type] = (counts[action.type] || 0) + 1;
  }
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
          <CardContent className="flex items-start gap-3 py-3 sm:gap-4 sm:py-4">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full sm:h-9 sm:w-9" />
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
