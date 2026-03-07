'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { fetchStream } from '@/data/actions/stream';
import type { StreamEntry } from '@/lib/types';

export function LiveStreamIndicator({ threadKey }: { threadKey: string }) {
  const [stream, setStream] = useState<StreamEntry | null>(null);
  const router = useRouter();

  useEffect(() => {
    let hadStream = false;

    async function poll() {
      const entry = await fetchStream(threadKey);
      setStream(entry);

      if (entry && !hadStream) {
        hadStream = true;
        router.refresh();
      } else if (!entry && hadStream) {
        hadStream = false;
        router.refresh();
      }
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [threadKey, router]);

  if (!stream) return null;

  return (
    <div className="flex flex-row-reverse gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
        <Bot className="h-4 w-4 text-green-500" />
      </div>
      <Card className="max-w-[75%] border-green-500/20 bg-green-500/5">
        <CardContent className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-green-500" />
          Bot is responding&hellip;
        </CardContent>
      </Card>
    </div>
  );
}
