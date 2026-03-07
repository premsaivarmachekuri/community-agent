'use client';

import { useTransition, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ActivitySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  function handleChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (value.trim()) {
          params.set('q', value.trim());
        } else {
          params.delete('q');
        }
        params.delete('limit');
        const query = params.toString();
        router.push(query ? `/activity?${query}` : '/activity');
      });
    }, 300);
  }

  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <label htmlFor="activity-search" className="sr-only">
        Search activity
      </label>
      <Input
        id="activity-search"
        key={searchParams.get('q') || ''}
        type="search"
        placeholder="Search activity..."
        defaultValue={searchParams.get('q') || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="h-8 pl-9 text-xs"
      />
    </div>
  );
}
