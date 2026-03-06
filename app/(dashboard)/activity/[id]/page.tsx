import { Suspense } from 'react';
import { connection } from 'next/server';
import { ArrowLeft, Bot, ExternalLink, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { FormattedTime } from '@/components/FormattedTime';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getActionById, getConversation } from '@/data/queries/actions';
import { isCurrentUserLead } from '@/lib/auth';
import { cn } from '@/lib/utils';

type Params = Promise<{ id: string }>;

export default function ConversationPage({ params }: { params: Params }) {
  return (
    <>
      <Header title="Conversation" description="Full conversation thread" />
      <div className="flex-1 p-6">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/activity">
            <ArrowLeft className="mr-1 h-3 w-3" /> Back to Activity
          </Link>
        </Button>
        <Suspense fallback={<ConversationSkeleton />}>
          <ConversationDetail params={params} />
        </Suspense>
      </div>
    </>
  );
}

async function ConversationDetail({ params }: { params: Params }) {
  await connection();
  const { id: actionId } = await params;

  const action = await getActionById(actionId);
  if (!action) notFound();

  const isDM = action.channel === 'DM';
  const canViewDM = isDM ? await isCurrentUserLead() : true;

  const messages = canViewDM ? await getConversation(actionId) : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">
            {action.description} &middot; {action.channel} &middot;{' '}
            <FormattedTime timestamp={action.timestamp} />
          </span>
          {action.metadata?.permalink && (
            <a href={action.metadata.permalink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-1 h-3 w-3" />
                View in Slack
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
      {isDM && !canViewDM ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-sm">
              DM conversations are only visible to the community lead.
            </span>
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No conversation content available for this action.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex gap-3', msg.role === 'assistant' && 'flex-row-reverse')}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Card className={cn('max-w-[75%]', msg.role === 'assistant' && 'bg-muted/50')}>
                <CardContent className="py-3 text-sm whitespace-pre-wrap break-words">
                  {cleanSlackText(msg.content)}
                  {msg.timestamp && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      <FormattedTime timestamp={msg.timestamp} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function cleanSlackText(text: string): string {
  return text
    .replace(/<@[A-Z0-9]+>/g, '')
    .replace(/@U[A-Z0-9]{8,}/g, '')
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, '#$1')
    .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, '$2')
    .replace(/<(https?:\/\/[^>]+)>/g, '$1')
    .trim();
}

function ConversationSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <Skeleton className="h-3.5 w-64" />
          <Skeleton className="h-5 w-24" />
        </CardContent>
      </Card>
      <div className="space-y-2 py-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
  );
}
