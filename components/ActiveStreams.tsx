'use client';

import { useEffect, useState, useRef, startTransition, ViewTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchActiveStreams, type AnnotatedStream } from '@/data/actions/stream';
import { useActiveStreams } from './ActiveStreamsContext';

export function ActiveStreams() {
  const [streams, setStreams] = useState<AnnotatedStream[]>([]);
  const hadStreamsRef = useRef(false);
  const router = useRouter();
  const { setActiveThreadKeys } = useActiveStreams();

  useEffect(() => {
    async function poll() {
      const entries = await fetchActiveStreams();

      setActiveThreadKeys(entries.filter((e) => e.isFollowUp).map((e) => e.threadId));

      if (entries.length > 0) {
        setStreams(entries);
        hadStreamsRef.current = true;
      } else if (hadStreamsRef.current) {
        hadStreamsRef.current = false;
        startTransition(() => {
          setStreams([]);
          router.refresh();
        });
      } else {
        setStreams(entries);
      }
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [router, setActiveThreadKeys]);

  const newStreams = streams.filter((s) => !s.isFollowUp);

  if (newStreams.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Radio className="h-3.5 w-3.5 animate-pulse text-green-500" />
        Live
      </div>
      <ViewTransition>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex items-start gap-3 py-3 sm:gap-4 sm:py-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/10 sm:h-9 sm:w-9">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-green-500 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm">Bot is responding&hellip;</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{newStreams[0].prompt}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{newStreams[0].channel}</span>
                {newStreams.length > 1 && <span>&middot; and {newStreams.length - 1} more</span>}
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 border-green-500/30 text-green-600">
              Streaming
            </Badge>
          </CardContent>
        </Card>
      </ViewTransition>
    </div>
  );
}
