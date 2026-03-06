import { Suspense } from 'react';
import { headers } from 'next/headers';
import { after } from 'next/server';
import {
  AlertTriangle,
  ArrowRightLeft,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  Search,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { FormattedTime } from '@/components/FormattedTime';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getRecentActions } from '@/data/queries/actions';
import { auth } from '@/lib/auth';
import { getLastSeen, setLastSeen } from '@/lib/store';
import type { BotAction } from '@/lib/types';
import { ViewTransition } from 'react';

const typeConfig: Record<
  BotAction['type'],
  {
    icon: typeof ArrowRightLeft;
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }
> = {
  routed: { icon: ArrowRightLeft, label: 'Routed', variant: 'outline' },
  welcomed: { icon: UserPlus, label: 'Welcomed', variant: 'secondary' },
  surfaced: { icon: Search, label: 'Surfaced', variant: 'outline' },
  answered: { icon: MessageSquare, label: 'Answered', variant: 'default' },
  flagged: { icon: AlertTriangle, label: 'Flagged', variant: 'destructive' },
};

export default function ActivityPage() {
  return (
    <>
      <Header title="Activity" description="Recent bot actions across your community" />
      <div className="flex-1 p-6">
        <Suspense fallback={<ActivityListSkeleton />}>
          <ActivityList />
        </Suspense>
      </div>
    </>
  );
}

async function ActivityList() {
  const [actions, session] = await Promise.all([
    getRecentActions(),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ]);

  let lastSeen = 0;
  if (session?.user?.id) {
    lastSeen = await getLastSeen(session.user.id);
  }

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No activity yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Bot actions will appear here as your community agent handles messages, routes questions,
          and welcomes members.
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
      {actions.map((action) => {
        const config = typeConfig[action.type];
        const Icon = config.icon;
        const isNew = lastSeen > 0 && action.timestamp > lastSeen;

        return (
          <ViewTransition key={action.id}>
            <Card className={isNew ? 'animate-new-glow' : ''}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <p className="text-sm">{action.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                    <div className="flex items-center gap-2 pt-0.5">
                      {action.type === 'answered' && (
                        <Link
                          href={`/activity/${action.id}` as any}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Conversation
                        </Link>
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
                </div>
                <div className="flex items-center gap-2">
                  {isNew && <Badge variant="secondary">New</Badge>}
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
              </CardContent>
            </Card>
          </ViewTransition>
        );
      })}
    </div>
  );
}

function ActivityListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="flex items-start gap-4 py-4">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
              <div className="h-4 w-36 animate-pulse rounded bg-muted" />
              <div className="h-7 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-16 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
