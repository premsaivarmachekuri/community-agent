'use client';

import { useOptimistic, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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

  function handleValueChange(value: string) {
    if (!value) return;
    startTransition(() => {
      setOptimisticType(value);
      const params = new URLSearchParams(searchParams);
      if (value === 'all') {
        params.delete('type');
      } else {
        params.set('type', value);
      }
      params.delete('limit');
      const query = params.toString();
      router.push(query ? `/activity?${query}` : '/activity');
    });
  }

  return (
    <ToggleGroup
      type="single"
      value={optimisticType}
      onValueChange={handleValueChange}
      variant="outline"
      size="sm"
      spacing={1}
      className="flex-wrap"
      data-pending={isPending ? '' : undefined}
    >
      {filters.map((filter) => {
        const count = counts?.[filter.value];
        const isActive = optimisticType === filter.value;
        return (
          <ToggleGroupItem
            key={filter.value}
            value={filter.value}
            className={cn(
              'gap-1.5 text-xs',
              isActive &&
                'bg-foreground text-background hover:bg-foreground/90 hover:text-background',
            )}
          >
            {filter.color && (
              <span
                className={cn(
                  'inline-block h-2 w-2 rounded-full',
                  filter.color,
                  isActive && 'opacity-70',
                )}
              />
            )}
            {filter.label}
            {count !== undefined && <span className={cn('tabular-nums opacity-60')}>{count}</span>}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
