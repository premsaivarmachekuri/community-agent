'use client';

import type { ReactNode } from 'react';
import { useActiveStreams } from './ActiveStreamsContext';

export function ActivityCardGlow({
  threadKey,
  children,
}: {
  threadKey?: string;
  children: ReactNode;
}) {
  const { activeThreadKeys } = useActiveStreams();
  const isActive = threadKey ? activeThreadKeys.includes(threadKey) : false;

  if (!isActive) return children;

  return (
    <div className="rounded-xl border border-green-500/20 bg-green-500/5 ring-2 ring-green-500/30">
      {children}
    </div>
  );
}
