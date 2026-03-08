'use client';

import { useEffect, useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { fetchStream } from '@/data/actions/stream';
import type { StreamEntry } from '@/lib/types';

export function LiveStreamIndicator({ threadKey }: { threadKey: string }) {
  const [stream, setStream] = useState<StreamEntry | null>(null);

  useEffect(() => {
    async function poll() {
      const entry = await fetchStream(threadKey);
      setStream(entry);
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [threadKey]);

  if (!stream) return null;

  return (
    <div className="flex flex-row-reverse gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
        <Bot className="h-4 w-4 text-success" />
      </div>
      <Card className="max-w-[75%] gap-0 py-0 border-success/20 bg-success/5">
        <CardContent className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-success" />
          Bot is responding&hellip;
        </CardContent>
      </Card>
    </div>
  );
}
