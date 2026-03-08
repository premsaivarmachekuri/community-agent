'use client';

import { useEffect, useState, ViewTransition } from 'react';
import { Loader2, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchActiveStreams, type AnnotatedStream } from '@/data/actions/stream';
import { cn } from '@/lib/utils';
import { useActiveStreams } from './ActiveStreamsContext';

export function ActiveStreams() {
  const [streams, setStreams] = useState<AnnotatedStream[]>([]);
  const { setActiveThreadKeys } = useActiveStreams();

  useEffect(() => {
    async function poll() {
      const entries = await fetchActiveStreams();
      setActiveThreadKeys(entries.filter((e) => e.isFollowUp).map((e) => e.threadId));
      setStreams(entries);
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [setActiveThreadKeys]);

  const newStreams = streams.filter((s) => !s.isFollowUp);

  const isActive = newStreams.length > 0;

  return (
    <ViewTransition>
      <Card
        className={cn('gap-0 py-0', isActive ? 'border-success/20 bg-success/5' : 'border-dashed')}
      >
        <CardContent className="flex items-center gap-3 py-2.5">
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
              isActive ? 'bg-success/10' : 'bg-muted',
            )}
          >
            {isActive ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-success" />
            ) : (
              <Radio className="h-3.5 w-3.5 text-muted-foreground/40" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              {isActive
                ? newStreams.length > 1
                  ? `Bot is responding to ${newStreams.length} conversations\u2026`
                  : `Bot is responding in ${newStreams[0].channel}\u2026`
                : 'Bot is idle'}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              isActive
                ? 'shrink-0 border-success/30 text-success'
                : 'shrink-0 text-muted-foreground/50'
            }
          >
            {isActive ? 'Active' : 'Idle'}
          </Badge>
        </CardContent>
      </Card>
    </ViewTransition>
  );
}
