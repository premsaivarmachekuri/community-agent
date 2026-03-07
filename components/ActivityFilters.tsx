'use client';

import { useOptimistic, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const filters = [
  { value: 'all', label: 'All', color: null },
  { value: 'answered', label: 'Answered', color: 'bg-blue-500' },
  { value: 'routed', label: 'Routed', color: 'bg-orange-500' },
  { value: 'welcomed', label: 'Welcomed', color: 'bg-green-500' },
  { value: 'surfaced', label: 'Surfaced', color: 'bg-purple-500' },
  { value: 'flagged', label: 'Flagged', color: 'bg-red-500' },
] as const;

type ActivityFiltersProps = {
  counts?: Record<string, number>;
};

export function ActivityFilters({ counts }: ActivityFiltersProps) {
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
      params.delete('limit');
      const query = params.toString();
      router.push(query ? `/activity?${query}` : '/activity');
    });
  }

  return (
    <div className="flex flex-wrap gap-2" data-pending={isPending ? '' : undefined}>
      {filters.map((filter) => {
        const count = counts?.[filter.value];
        return (
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
            {filter.color && (
              <span
                className={cn(
                  'mr-1.5 inline-block h-2 w-2 rounded-full',
                  filter.color,
                  optimisticType === filter.value && 'opacity-70',
                )}
              />
            )}
            {filter.label}
            {count !== undefined && (
              <span
                className={cn(
                  'ml-1.5 tabular-nums',
                  optimisticType === filter.value
                    ? 'text-background/70'
                    : 'text-muted-foreground/60',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
