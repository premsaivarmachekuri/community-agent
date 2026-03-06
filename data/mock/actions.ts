import type { BotAction, ConversationMessage } from '@/lib/types';

const HOUR = 60 * 60 * 1000;

function hoursAgo(hours: number): number {
  return Date.now() - hours * HOUR;
}

export const mockActions: BotAction[] = [
  {
    id: 'mock-1',
    type: 'answered',
    channel: '#help',
    user: 'sarah.chen',
    description: 'Answered a question about authentication setup',
    metadata: { permalink: 'https://slack.com/archives/C0EXAMPLE/p1234567890' },
    timestamp: hoursAgo(1),
  },
  {
    id: 'mock-2',
    type: 'routed',
    channel: '#general',
    user: 'mike.johnson',
    description: 'Suggested moving bug report from #general to #bugs',
    metadata: { suggestedChannel: '#bugs' },
    timestamp: hoursAgo(2),
  },
  {
    id: 'mock-3',
    type: 'welcomed',
    channel: '#introductions',
    user: 'alex.rivera',
    description: 'Welcomed new member to the community',
    timestamp: hoursAgo(3),
  },
  {
    id: 'mock-4',
    type: 'surfaced',
    channel: '#help',
    description: 'Found 3 unanswered questions in the last 24 hours',
    metadata: { count: '3', hours: '24' },
    timestamp: hoursAgo(4),
  },
  {
    id: 'mock-5',
    type: 'answered',
    channel: '#help',
    user: 'priya.patel',
    description: 'Answered a question about API endpoints',
    metadata: { permalink: 'https://slack.com/archives/C0EXAMPLE/p1234567891' },
    timestamp: hoursAgo(6),
  },
  {
    id: 'mock-6',
    type: 'routed',
    channel: '#general',
    user: 'emma.davis',
    description: 'Suggested posting feature requests in #help',
    metadata: { suggestedChannel: '#help' },
    timestamp: hoursAgo(8),
  },
  {
    id: 'mock-7',
    type: 'welcomed',
    channel: '#introductions',
    user: 'jordan.lee',
    description: 'Welcomed new member to the community',
    timestamp: hoursAgo(12),
  },
  {
    id: 'mock-8',
    type: 'surfaced',
    channel: '#bugs',
    description: 'Found 1 unanswered bug report in the last 48 hours',
    metadata: { count: '1', hours: '48' },
    timestamp: hoursAgo(24),
  },
  {
    id: 'mock-9',
    type: 'answered',
    channel: '#help',
    user: 'nina.kumar',
    description: 'Helped with Redis configuration for local dev',
    timestamp: hoursAgo(20),
  },
  {
    id: 'mock-10',
    type: 'flagged',
    channel: 'DM',
    description: 'Flagged issue to community lead: Potential account compromise reported',
    metadata: { summary: 'Potential account compromise reported' },
    timestamp: hoursAgo(5),
  },
];

export const mockStats = {
  routed: 2,
  welcomed: 2,
  surfaced: 2,
  answered: 3,
  flagged: 1,
  total: 10,
};

export const mockConversations: Record<string, ConversationMessage[]> = {
  'mock-1': [
    {
      role: 'user',
      content: 'How do I set up authentication in this project?',
      timestamp: hoursAgo(1),
    },
    {
      role: 'assistant',
      content:
        'You can set up authentication by configuring the `BETTER_AUTH_SECRET` environment variable and adding GitHub OAuth credentials. Check the README for the full setup guide.',
      timestamp: hoursAgo(1),
    },
  ],
  'mock-5': [
    { role: 'user', content: 'What API endpoints are available?', timestamp: hoursAgo(6) },
    {
      role: 'assistant',
      content:
        'The main endpoints are `/api/slack` for Slack webhooks, `/api/test-action` for testing, and `/api/auth/[...all]` for authentication. Check `app/api/` for the full list.',
      timestamp: hoursAgo(6),
    },
  ],
  'mock-9': [
    {
      role: 'user',
      content: "I'm having trouble connecting Redis locally. Any tips?",
      timestamp: hoursAgo(20),
    },
    {
      role: 'assistant',
      content:
        'For local Redis, you can use Upstash Redis (free tier). Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your `.env.local`. If you just want to see the admin panel, you can skip Redis entirely — it falls back to mock data.',
      timestamp: hoursAgo(20),
    },
  ],
};
