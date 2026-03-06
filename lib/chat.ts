import { Chat, ConsoleLogger } from 'chat';
import { createSlackAdapter } from '@chat-adapter/slack';
import { createRedisState } from '@chat-adapter/state-redis';
import { workflowAgent } from '@/workflows/agent-workflow';
import { getSlackClient } from '@/lib/slack';
import { start } from 'workflow/api';

const logger = new ConsoleLogger('info');

const slackClient = getSlackClient();

/** Thread IDs follow the format: "slack:CHANNEL_ID:THREAD_TS" */
function parseThreadId(threadId: string): { channelId: string; threadTs: string } | null {
  const parts = threadId.split(':');
  if (parts.length >= 3 && parts[0] === 'slack') {
    return { channelId: parts[1], threadTs: parts[2] };
  }
  return null;
}

/** Excludes bot's own messages and strips the latest message (passed separately as the prompt). */
async function fetchThreadHistory(
  channelId: string,
  threadTs: string,
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  try {
    const result = await slackClient.conversations.replies({
      channel: channelId,
      ts: threadTs,
      limit: 100, // Reasonable limit for context
    });

    if (!result.messages) return [];

    const authResult = await slackClient.auth.test();
    const botUserId = authResult.user_id;

    const messages = result.messages.slice(0, -1);

    return messages
      .filter((msg) => msg.text && !('subtype' in msg))
      .map((msg) => ({
        role: (msg.user === botUserId ? 'assistant' : 'user') as 'user' | 'assistant',
        content: msg.text!,
      }));
  } catch (error) {
    logger.error('Failed to fetch thread history', { error: String(error) });
    return [];
  }
}

async function setThinkingStatus(threadId: string): Promise<void> {
  const threadInfo = parseThreadId(threadId);
  if (threadInfo) {
    try {
      await slackClient.apiCall('assistant.threads.setStatus', {
        channel_id: threadInfo.channelId,
        thread_ts: threadInfo.threadTs,
        status: 'is thinking...',
      });
    } catch (error) {
      logger.error('Failed to set assistant status', { error: String(error) });
    }
  }
}

export const chat = new Chat({
  userName: 'agent',
  adapters: {
    slack: createSlackAdapter({
      botToken: process.env.SLACK_BOT_TOKEN!,
      signingSecret: process.env.SLACK_SIGNING_SECRET!,
      logger: logger.child('slack'),
    }),
  },
  state: createRedisState({ url: process.env.REDIS_URL!, logger }),
  logger,
});

async function handleMessage(
  thread: { id: string; post: (text: string) => Promise<any> },
  message: { text?: string } | undefined,
): Promise<void> {
  await setThinkingStatus(thread.id);

  const threadInfo = parseThreadId(thread.id);
  if (!threadInfo) {
    await thread.post('Could not parse thread information.');
    return;
  }

  if (!message?.text) {
    await thread.post('Please provide a message for me to process.');
    return;
  }

  const history = await fetchThreadHistory(threadInfo.channelId, threadInfo.threadTs);

  start(workflowAgent, [
    {
      prompt: message.text,
      history,
      slack: {
        channelId: threadInfo.channelId,
        threadTs: threadInfo.threadTs,
        botToken: process.env.SLACK_BOT_TOKEN!,
      },
    },
  ]).catch((err) => {
    logger.error('Workflow failed to start', { error: String(err) });
    thread.post('Sorry, something went wrong processing your message.').catch(() => {});
  });
}

chat.onNewMention(async (thread, message) => {
  await thread.subscribe();
  await handleMessage(thread, message);
});

chat.onSubscribedMessage(handleMessage);
