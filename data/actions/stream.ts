'use server';

import type { StreamEntry } from '@/lib/types';
import {
  getActiveStreams,
  getStreamByThreadKey,
  hasActionForThread,
  isStoreConfigured,
} from '@/lib/store';
import { requireSession } from '@/data/queries/auth';

export type AnnotatedStream = StreamEntry & { isFollowUp: boolean };

export async function fetchActiveStreams(): Promise<AnnotatedStream[]> {
  await requireSession();
  if (!isStoreConfigured()) return [];
  const streams = await getActiveStreams();
  const results = await Promise.all(
    streams.map(async (s) => ({
      ...s,
      isFollowUp: await hasActionForThread(s.threadId),
    })),
  );
  return results;
}

export async function fetchStream(threadKey: string): Promise<StreamEntry | null> {
  await requireSession();
  if (!isStoreConfigured()) return null;
  return getStreamByThreadKey(threadKey);
}
