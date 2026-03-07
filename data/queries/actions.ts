import { cache } from 'react';
import type { BotAction, ConversationMessage } from '@/lib/types';
import {
  getRecentActions as storeGetRecentActions,
  getActionById as storeGetActionById,
  getStats as storeGetStats,
  getConversation as storeGetConversation,
  isStoreConfigured,
  type ActionStats,
} from '@/lib/store';
import { mockActions, mockStats, mockConversations } from '@/data/mock/actions';
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

export const getDashboardStats = cache(async (): Promise<ActionStats> => {
  await requireSession();
  if (!isStoreConfigured()) {
    await delay(2000);
    return mockStats;
  }
  return storeGetStats();
});

export const getConversation = cache(async (actionId: string): Promise<ConversationMessage[]> => {
  await requireSession();
  if (!isStoreConfigured()) {
    await delay(500);
    return mockConversations[actionId] || [];
  }
  return storeGetConversation(actionId);
});
