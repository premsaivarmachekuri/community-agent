import { WebClient } from '@slack/web-api';
import { chat } from '@/lib/chat';
import { logAction } from '@/lib/store';
import type { BotAction, ConversationMessage, SlackContext } from '@/lib/types';

export async function stepPostToSlack(slack: SlackContext, text: string): Promise<void> {
  'use step';

  const slackAdapter = chat.getAdapter('slack');
  const threadId = slackAdapter.encodeThreadId({
    channel: slack.channelId,
    threadTs: slack.threadTs,
  });

  await slackAdapter.postMessage(threadId, { markdown: text });
}

export async function stepResolveChannelName(channelId: string): Promise<string> {
  'use step';

  try {
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    const info = await slack.conversations.info({ channel: channelId });
    return info.channel?.name ? `#${info.channel.name}` : 'DM';
  } catch {
    return 'DM';
  }
}

export async function stepGetPermalink(
  channelId: string,
  messageTs: string,
): Promise<string | null> {
  'use step';

  try {
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    const result = await slack.chat.getPermalink({ channel: channelId, message_ts: messageTs });
    return result.permalink ?? null;
  } catch {
    return null;
  }
}

export async function stepLogAction(
  action: Omit<BotAction, 'id' | 'timestamp'>,
  conversation?: ConversationMessage[],
  threadKey?: string,
): Promise<void> {
  'use step';

  await logAction(action, conversation, threadKey);
}
