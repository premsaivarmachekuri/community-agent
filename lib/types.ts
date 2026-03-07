/** Channel configuration for routing and community management */
export interface ChannelConfig {
  name: string;
  description: string;
  topics: string[];
  isWelcomeChannel?: boolean;
}

/** Slack context for posting responses */
export interface SlackContext {
  channelId: string;
  threadTs: string;
  botToken: string;
}

/** Chat message for conversation history */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Input for running the agent */
export interface AgentInput {
  prompt: string;
  slack?: SlackContext;
  history?: ChatMessage[];
}

/** Agent run result */
export interface AgentResult {
  success: boolean;
  response: string;
  error?: string;
}

/** Bot action logged to the admin panel */
export type BotAction = {
  id: string;
  type: 'routed' | 'welcomed' | 'surfaced' | 'answered' | 'flagged';
  channel: string;
  user?: string;
  description: string;
  metadata?: Record<string, string>;
  timestamp: number;
  lastUpdated?: number;
  threadKey?: string;
};

/** A message in a stored conversation */
export type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
};

/** A conversation stored alongside an action */
export type Conversation = {
  actionId: string;
  messages: ConversationMessage[];
};

/** An active agent stream visible in the admin panel */
export type StreamEntry = {
  threadId: string;
  channel: string;
  prompt: string;
  text: string;
  status: 'streaming' | 'done';
  timestamp: number;
};
