'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Loader2, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const DEFAULT_INTERVAL_S = 30;

type AutoRefreshProps = {
  intervalSeconds?: number;
};

export function AutoRefresh({ intervalSeconds = DEFAULT_INTERVAL_S }: AutoRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [justChecked, setJustChecked] = useState(false);

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  useEffect(() => {
    const id = setInterval(refresh, intervalSeconds * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalSeconds]);

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending) {
      setJustChecked(true);
      const timeout = setTimeout(() => setJustChecked(false), 2000);
      return () => clearTimeout(timeout);
    }
    wasPending.current = isPending;
  }, [isPending]);

  if (isPending) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Checking for new actions...</span>
      </div>
    );
  }

  if (justChecked) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="h-3.5 w-3.5" />
        <span>Up to date</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
          onClick={refresh}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Check now
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Auto-refreshes every {intervalSeconds}s</p>
      </TooltipContent>
    </Tooltip>
  );
}
