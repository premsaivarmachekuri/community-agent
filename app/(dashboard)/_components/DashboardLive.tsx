'use client';

import { useEffect, useState } from 'react';
import { Loader2, Radio } from 'lucide-react';
import { fetchActiveStreams } from '@/data/actions/stream';
import { cn } from '@/lib/utils';

export function DashboardLive() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function poll() {
      const entries = await fetchActiveStreams();
      setCount(entries.length);
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm',
        count > 0 ? 'border-success/20 bg-success/5' : 'border-dashed text-muted-foreground/50',
      )}
    >
      <Radio
        className={cn(
          'h-3.5 w-3.5',
          count > 0 ? 'animate-pulse text-success' : 'text-muted-foreground/30',
        )}
      />
      {count > 0 ? (
        <span>
          Bot is handling{' '}
          <span className="font-medium text-success">
            {count} {count === 1 ? 'conversation' : 'conversations'}
          </span>
        </span>
      ) : (
        <span>Bot is idle</span>
      )}
      {count > 0 && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-success" />}
    </div>
  );
}
