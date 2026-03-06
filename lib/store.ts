import { Redis } from '@upstash/redis';
import type { BotAction, ConversationMessage } from './types';
import { createLogger } from './logger';

const logger = createLogger('store');

let redis: Redis | null = null;

function getRedisCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function getRedis(): Redis | null {
  if (redis) return redis;

  const creds = getRedisCredentials();
  if (!creds) return null;

  redis = new Redis(creds);
  return redis;
}

export function isStoreConfigured(): boolean {
  return getRedisCredentials() !== null;
}

const ACTIONS_KEY = 'bot:actions';
const STATS_KEY = 'bot:stats';
const CONVERSATIONS_PREFIX = 'bot:conv:';
const THREAD_ACTION_PREFIX = 'bot:thread:';
const LASTSEEN_PREFIX = 'bot:lastseen:';

export async function logAction(
  action: Omit<BotAction, 'id' | 'timestamp'>,
  conversation?: ConversationMessage[],
  threadKey?: string,
): Promise<string | undefined> {
  const client = getRedis();
  if (!client) return undefined;

  if (threadKey) {
    const existingActionId = await client.get<string>(`${THREAD_ACTION_PREFIX}${threadKey}`);
    if (existingActionId) {
      return updateConversation(existingActionId, conversation);
    }
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const entry: BotAction = {
    ...action,
    id,
    timestamp: Date.now(),
  };

  try {
    const ops: Promise<any>[] = [
      client.zadd(ACTIONS_KEY, { score: entry.timestamp, member: JSON.stringify(entry) }),
      client.hincrby(STATS_KEY, entry.type, 1),
      client.hincrby(STATS_KEY, 'total', 1),
    ];

    if (conversation && conversation.length > 0) {
      ops.push(
        client.set(`${CONVERSATIONS_PREFIX}${id}`, JSON.stringify(conversation), {
          ex: 60 * 60 * 24 * 30,
        }),
      );
    }

    if (threadKey) {
      ops.push(client.set(`${THREAD_ACTION_PREFIX}${threadKey}`, id, { ex: 60 * 60 * 24 * 30 }));
    }

    await Promise.all(ops);
    return id;
  } catch (error) {
    logger.error('Failed to log action', { error: String(error) });
    return undefined;
  }
}

async function updateConversation(
  actionId: string,
  conversation?: ConversationMessage[],
): Promise<string | undefined> {
  const client = getRedis();
  if (!client || !conversation?.length) return actionId;

  try {
    const now = Date.now();

    // Find and update the action's lastUpdated + re-score it so it sorts to the top
    const raw = await client.zrange<string[]>(ACTIONS_KEY, 0, -1);
    for (const entry of raw) {
      const action: BotAction = typeof entry === 'string' ? JSON.parse(entry) : entry;
      if (action.id === actionId) {
        const updated = { ...action, lastUpdated: now };
        await client.zrem(ACTIONS_KEY, JSON.stringify(action));
        await client.zadd(ACTIONS_KEY, { score: now, member: JSON.stringify(updated) });
        break;
      }
    }

    await client.set(`${CONVERSATIONS_PREFIX}${actionId}`, JSON.stringify(conversation), {
      ex: 60 * 60 * 24 * 30,
    });
    return actionId;
  } catch (error) {
    logger.error('Failed to update conversation', { error: String(error) });
    return actionId;
  }
}

export async function getConversation(actionId: string): Promise<ConversationMessage[]> {
  const client = getRedis();
  if (!client) return [];

  try {
    const raw = await client.get<string>(`${CONVERSATIONS_PREFIX}${actionId}`);
    if (!raw) return [];
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (error) {
    logger.error('Failed to get conversation', { error: String(error) });
    return [];
  }
}

export async function getRecentActions(limit = 50): Promise<BotAction[]> {
  const client = getRedis();
  if (!client) return [];

  try {
    const raw = await client.zrange<string[]>(ACTIONS_KEY, 0, limit - 1, { rev: true });
    return raw.map((entry) => (typeof entry === 'string' ? JSON.parse(entry) : entry));
  } catch (error) {
    logger.error('Failed to get recent actions', { error: String(error) });
    return [];
  }
}

export type ActionStats = {
  routed: number;
  welcomed: number;
  surfaced: number;
  answered: number;
  flagged: number;
  total: number;
};

export async function clearAllActions(): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    const [convKeys, threadKeys] = await Promise.all([
      client.keys(`${CONVERSATIONS_PREFIX}*`),
      client.keys(`${THREAD_ACTION_PREFIX}*`),
    ]);
    const allKeys = [ACTIONS_KEY, STATS_KEY, ...convKeys, ...threadKeys];
    if (allKeys.length > 0) {
      await client.del(...allKeys);
    }
  } catch (error) {
    logger.error('Failed to clear actions', { error: String(error) });
  }
}

export async function getActionById(id: string): Promise<BotAction | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const raw = await client.zrange<string[]>(ACTIONS_KEY, 0, -1, { rev: true });
    for (const entry of raw) {
      const action: BotAction = typeof entry === 'string' ? JSON.parse(entry) : entry;
      if (action.id === id) return action;
    }
    return null;
  } catch (error) {
    logger.error('Failed to get action by id', { error: String(error) });
    return null;
  }
}

export async function getLastSeen(userId: string): Promise<number> {
  const client = getRedis();
  if (!client) return 0;

  try {
    const ts = await client.get<number>(`${LASTSEEN_PREFIX}${userId}`);
    return ts ?? 0;
  } catch (error) {
    logger.error('Failed to get last seen', { error: String(error) });
    return 0;
  }
}

export async function setLastSeen(userId: string, timestamp: number): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    await client.set(`${LASTSEEN_PREFIX}${userId}`, timestamp);
  } catch (error) {
    logger.error('Failed to set last seen', { error: String(error) });
  }
}

export async function getStats(): Promise<ActionStats> {
  const client = getRedis();
  if (!client) {
    return { routed: 0, welcomed: 0, surfaced: 0, answered: 0, flagged: 0, total: 0 };
  }

  try {
    const raw = await client.hgetall<Record<string, string>>(STATS_KEY);
    if (!raw) return { routed: 0, welcomed: 0, surfaced: 0, answered: 0, flagged: 0, total: 0 };

    return {
      routed: Number(raw.routed || 0),
      welcomed: Number(raw.welcomed || 0),
      surfaced: Number(raw.surfaced || 0),
      answered: Number(raw.answered || 0),
      flagged: Number(raw.flagged || 0),
      total: Number(raw.total || 0),
    };
  } catch (error) {
    logger.error('Failed to get stats', { error: String(error) });
    return { routed: 0, welcomed: 0, surfaced: 0, answered: 0, flagged: 0, total: 0 };
  }
}
