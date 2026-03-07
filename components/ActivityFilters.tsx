'use client';

import { useOptimistic, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'answered', label: 'Answered' },
  { value: 'routed', label: 'Routed' },
  { value: 'welcomed', label: 'Welcomed' },
  { value: 'surfaced', label: 'Surfaced' },
  { value: 'flagged', label: 'Flagged' },
] as const;

export function ActivityFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type') || 'all';
  const [optimisticType, setOptimisticType] = useOptimistic(currentType);
  const [isPending, startTransition] = useTransition();

  function filterAction(type: string) {
    startTransition(() => {
      setOptimisticType(type);
      const params = new URLSearchParams(searchParams);
      if (type === 'all') {
        params.delete('type');
      } else {
        params.set('type', type);
      }
      const query = params.toString();
      router.push(query ? `/activity?${query}` : '/activity');
    });
  }

  return (
    <div className="flex flex-wrap gap-2" data-pending={isPending ? '' : undefined}>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => filterAction(filter.value)}
          className={cn(
            'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
            optimisticType === filter.value
              ? 'border-foreground/20 bg-foreground text-background'
              : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
