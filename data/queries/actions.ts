import { cache } from 'react';
import { cacheLife } from 'next/cache';
import type { BotAction, ConversationMessage } from '@/lib/types';
import {
  getRecentActions as storeGetRecentActions,
  getActionById as storeGetActionById,
  getConversation as storeGetConversation,
  isStoreConfigured,
} from '@/lib/store';
import { mockActions, mockConversations } from '@/data/mock/actions';
import { requireSession } from './auth';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getRecentActions = cache(async (): Promise<BotAction[]> => {
  await requireSession();
  if (!isStoreConfigured()) {
    await delay(2000);
    return [...mockActions].sort(
      (a, b) => (b.lastUpdated ?? b.timestamp) - (a.lastUpdated ?? a.timestamp),
    );
  }
  return storeGetRecentActions();
});

export const getActionById = cache(async (id: string): Promise<BotAction | null> => {
  await requireSession();
  if (!isStoreConfigured()) {
    await delay(500);
    return mockActions.find((a) => a.id === id) ?? null;
  }
  return storeGetActionById(id);
});

export const getConversation = cache(async (actionId: string): Promise<ConversationMessage[]> => {
  await requireSession();
  if (!isStoreConfigured()) {
    await delay(500);
    return mockConversations[actionId] || [];
  }
  return storeGetConversation(actionId);
});

export type AnalyticsData = {
  buckets: AnalyticsBucket[];
  typeCounts: Record<string, number>;
  totalActions: number;
};

export type AnalyticsBucket = {
  date: string;
  answered: number;
  routed: number;
  welcomed: number;
  surfaced: number;
  flagged: number;
};

async function fetchAnalyticsData(): Promise<AnalyticsData> {
  'use cache: remote';
  cacheLife('days');

  let actions: BotAction[];
  if (!isStoreConfigured()) {
    actions = [...mockActions].sort(
      (a, b) => (b.lastUpdated ?? b.timestamp) - (a.lastUpdated ?? a.timestamp),
    );
  } else {
    actions = await storeGetRecentActions();
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();

  function startOfDay(ts: number) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  const todayStart = startOfDay(now);
  const earliest = actions.length > 0 ? Math.min(...actions.map((a) => a.timestamp)) : now;
  const earliestDayStart = startOfDay(earliest);
  const spanDays = Math.max(Math.round((todayStart - earliestDayStart) / dayMs) + 1, 2);

  const buckets: AnalyticsBucket[] = [];

  for (let i = 0; i < spanDays; i++) {
    const d = new Date(earliestDayStart + i * dayMs);
    buckets.push({
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      answered: 0,
      routed: 0,
      welcomed: 0,
      surfaced: 0,
      flagged: 0,
    });
  }

  const typeCounts: Record<string, number> = {};

  for (const action of actions) {
    typeCounts[action.type] = (typeCounts[action.type] || 0) + 1;

    const actionDayStart = startOfDay(action.timestamp);
    const idx = Math.round((actionDayStart - earliestDayStart) / dayMs);
    if (idx >= 0 && idx < spanDays) {
      buckets[idx][action.type]++;
    }
  }

  return { buckets, typeCounts, totalActions: actions.length };
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  await requireSession();
  return fetchAnalyticsData();
}
