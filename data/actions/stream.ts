'use server';

import type { StreamEntry } from '@/lib/types';
import { getActiveStreams, getStreamByThreadKey, isStoreConfigured } from '@/lib/store';

export async function fetchActiveStreams(): Promise<StreamEntry[]> {
  if (!isStoreConfigured()) return [];
  return getActiveStreams();
}

export async function fetchStream(threadKey: string): Promise<StreamEntry | null> {
  if (!isStoreConfigured()) return null;
  return getStreamByThreadKey(threadKey);
}
