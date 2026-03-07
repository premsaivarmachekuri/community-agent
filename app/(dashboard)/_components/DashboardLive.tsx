'use client';

import { useEffect, useState, useRef, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Radio } from 'lucide-react';
import { fetchActiveStreams } from '@/data/actions/stream';
import { cn } from '@/lib/utils';

export function DashboardLive() {
  const [count, setCount] = useState(0);
  const hadStreamsRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    async function poll() {
      const entries = await fetchActiveStreams();

      if (entries.length > 0) {
        setCount(entries.length);
        hadStreamsRef.current = true;
      } else if (hadStreamsRef.current) {
        hadStreamsRef.current = false;
        startTransition(() => {
          setCount(0);
          router.refresh();
        });
      } else {
        setCount(0);
      }
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm',
        count > 0
          ? 'border-green-500/20 bg-green-500/5'
          : 'border-dashed text-muted-foreground/50',
      )}
    >
      <Radio
        className={cn(
          'h-3.5 w-3.5',
          count > 0 ? 'animate-pulse text-green-500' : 'text-muted-foreground/30',
        )}
      />
      {count > 0 ? (
        <span>
          Bot is handling{' '}
          <span className="font-medium text-green-600">
            {count} {count === 1 ? 'conversation' : 'conversations'}
          </span>
        </span>
      ) : (
        <span>Bot is idle</span>
      )}
      {count > 0 && (
        <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-green-500" />
      )}
    </div>
  );
}
