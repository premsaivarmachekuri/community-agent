import { Suspense, ViewTransition } from 'react';
import { connection } from 'next/server';
import { ArrowLeft, Bot, ExternalLink, Lock, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import { Header } from '@/components/Header';
import { FormattedTime } from '@/components/FormattedTime';
import { LiveStreamIndicator } from './_components/LiveStreamIndicator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getConversationDetail } from '@/data/queries/activity';
import { cn, cleanSlackText } from '@/lib/utils';

export default function ConversationPage({ params }: PageProps<'/activity/[id]'>) {
  return (
    <>
      <Header title="Conversation" description="Full conversation thread" />
      <div className="flex-1 p-4">
        <Button variant="ghost" size="sm" className="mb-3" asChild>
          <Link href="/activity">
            <ArrowLeft className="mr-1 h-3 w-3" /> Activity
          </Link>
        </Button>
        <Suspense
          fallback={
            <ViewTransition exit="slide-down">
              <ConversationSkeleton />
            </ViewTransition>
          }
        >
          <ViewTransition default="none" enter="slide-up">
            <ConversationDetail params={params} />
          </ViewTransition>
        </Suspense>
      </div>
    </>
  );
}

async function ConversationDetail({ params }: Pick<PageProps<'/activity/[id]'>, 'params'>) {
  await connection();
  const { id: actionId } = await params;

  const detail = await getConversationDetail(actionId);
  if (!detail) notFound();

  const { action, messages, threadKey, dmRestricted } = detail;

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
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 sm:hidden">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <ExternalLink className="mr-1 h-3 w-3" />
                View in Slack
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
      {dmRestricted ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2.5 py-6 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-sm">
              DM conversations are only visible to the community lead.
            </span>
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            <h3 className="mt-3 text-base font-medium">No conversation content</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This action was logged without a conversation thread.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <ViewTransition key={i}>
              <div className={cn('flex gap-3', msg.role === 'assistant' && 'flex-row-reverse')}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  {msg.role === 'user' ? (
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <Card
                  className={cn(
                    'max-w-[85%] gap-0 py-0 sm:max-w-[75%]',
                    msg.role === 'assistant' && 'bg-muted/50',
                  )}
                >
                  <CardContent className="px-4 py-2 text-sm wrap-break-word">
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1 prose-headings:text-sm prose-headings:font-semibold">
                        <Markdown>{cleanSlackText(msg.content)}</Markdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{cleanSlackText(msg.content)}</span>
                    )}
                    {msg.timestamp && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <FormattedTime timestamp={msg.timestamp} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ViewTransition>
          ))}
          {threadKey && <LiveStreamIndicator threadKey={threadKey} />}
        </div>
      )}
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-8 w-28" />
        </CardContent>
      </Card>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <Skeleton className="h-12 w-3/5 rounded-xl" />
        </div>
        <div className="flex items-start flex-row-reverse gap-3">
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <Skeleton className="h-16 w-3/5 rounded-xl" />
        </div>
        <div className="flex items-start gap-3">
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-2/5 rounded-xl" />
        </div>
        <div className="flex items-start flex-row-reverse gap-3">
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <Skeleton className="h-14 w-3/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
