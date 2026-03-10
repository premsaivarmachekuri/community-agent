import { DurableAgent } from '@workflow/ai/agent';
import { getWritable } from 'workflow';
import type { UIMessageChunk } from 'ai';
import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import type { AgentInput, AgentResult } from '@/lib/types';
import { createLogger } from '@/lib/logger';
import { config } from '@/lib/config';
import { buildInstructions } from '@/lib/agent';
import { durableTools } from './tools';
import {
  stepPostToSlack,
  stepResolveChannelName,
  stepGetPermalink,
  stepLogAction,
  stepSaveUserMessage,
  stepStartStream,
  stepEndStream,
} from './steps';

export async function workflowAgent(input: AgentInput): Promise<AgentResult> {
  'use workflow';

  const logger = createLogger('agent-workflow');

  logger.info('Workflow started', { promptLength: input.prompt.length });

  let responseText = 'No response generated.';
  let success = true;
  let result: any = null;

  const streamThreadId = input.slack
    ? `${input.slack.channelId}:${input.slack.threadTs}`
    : undefined;

  try {
    let threadPermalink: string | null = null;
    if (input.slack && !input.slack.channelId.startsWith('D')) {
      threadPermalink = await stepGetPermalink(input.slack.channelId, input.slack.threadTs);
    }

    const systemSuffix = threadPermalink
      ? `\n\nCurrent thread permalink (pass to flag_to_lead if needed): ${threadPermalink}`
      : '';

    const agent = new DurableAgent({
      model: config.model,
      system: buildInstructions() + systemSuffix,
      tools: durableTools as any,
      providerOptions: {
        anthropic: {
          contextManagement: {
            edits: [
              {
                type: 'clear_tool_uses_20250919',
                trigger: { type: 'input_tokens', value: 80_000 },
                keep: { type: 'tool_uses', value: 5 },
                clearAtLeast: { type: 'input_tokens', value: 5000 },
                clearToolInputs: true,
              },
              {
                type: 'compact_20260112',
                trigger: { type: 'input_tokens', value: 100_000 },
                instructions:
                  'Summarize the conversation concisely, preserving key decisions, tool results, and context.',
                pauseAfterCompaction: false,
              },
            ],
          },
        } satisfies AnthropicLanguageModelOptions,
      },
    });

    const messages = [...(input.history || []), { role: 'user' as const, content: input.prompt }];

    if (streamThreadId && input.slack) {
      const streamChannelName = await stepResolveChannelName(input.slack.channelId);
      await stepStartStream({
        threadId: streamThreadId,
        channel: streamChannelName,
        prompt: input.prompt
          .replace(/<@[A-Z0-9]+>/g, '')
          .replace(/@U[A-Z0-9]{8,}/g, '')
          .trim(),
        text: '',
        status: 'streaming',
        timestamp: Date.now(),
      });

      if (input.history?.length) {
        await stepSaveUserMessage(streamThreadId, [
          { role: 'user', content: input.prompt, timestamp: Date.now() },
        ]);
      }
    }

    result = await agent.stream({
      messages,
      writable: getWritable<UIMessageChunk>(),
      maxSteps: 50,
    });

    const lastAssistantMessage = result.messages.filter((m: any) => m.role === 'assistant').pop();

    if (lastAssistantMessage?.content) {
      if (typeof lastAssistantMessage.content === 'string') {
        responseText = lastAssistantMessage.content;
      } else if (Array.isArray(lastAssistantMessage.content)) {
        responseText =
          lastAssistantMessage.content
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('') || 'No response generated.';
      }
    }

    logger.info('Agent completed', { responseLength: responseText.length });
  } catch (error) {
    success = false;
    responseText = `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    logger.error('Agent failed', { error: String(error) });
  }

  if (input.slack) {
    const isDM = input.slack.channelId.startsWith('D');
    const isFirstMessage = !input.history?.length;
    const postText =
      isDM && isFirstMessage
        ? `${responseText}\n\n_This conversation may be reviewed by the community lead._`
        : responseText;
    await stepPostToSlack(input.slack, postText);
  }

  if (success && input.slack) {
    const toolCalls =
      result?.messages
        ?.filter((m: any) => m.role === 'assistant' && Array.isArray(m.content))
        .flatMap((m: any) => m.content.filter((p: any) => p.type === 'tool-call')) ?? [];

    const toolsWithOwnLogging = ['suggest_channel', 'unanswered', 'flag_to_lead'];
    const alreadyLogged = toolCalls.some((tc: any) => toolsWithOwnLogging.includes(tc.toolName));

    const routingPattern = /\b(?:post|report|ask|go|head)\b.*\b#(\w+)\b/i;
    const routingMatch = !alreadyLogged && routingPattern.test(responseText);

    if (routingMatch) {
      const channelName = await stepResolveChannelName(input.slack.channelId);
      const match = responseText.match(/#(\w+)/);
      const suggestedChannel = match ? `#${match[1]}` : channelName;

      await stepLogAction(
        {
          type: 'routed',
          channel: channelName,
          description: `Suggested routing question to ${suggestedChannel}`,
          metadata: {},
        },
        [],
        `${input.slack.channelId}:${input.slack.threadTs}`,
      );
    } else if (!alreadyLogged) {
      const channelName = await stepResolveChannelName(input.slack.channelId);

      const isDM = input.slack.channelId.startsWith('D');
      const metadata: Record<string, string> = {};
      if (!isDM) {
        const permalink = await stepGetPermalink(input.slack.channelId, input.slack.threadTs);
        if (permalink) {
          metadata.permalink = permalink;
        }
      }

      const conversation = [
        ...(input.history || []).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: input.prompt, timestamp: Date.now() },
        { role: 'assistant' as const, content: responseText, timestamp: Date.now() },
      ];

      const threadKey = `${input.slack.channelId}:${input.slack.threadTs}`;

      const cleanPrompt = input.prompt
        .replace(/<@[A-Z0-9]+>/g, '')
        .replace(/@U[A-Z0-9]{8,}/g, '')
        .trim();
      const preview = cleanPrompt.length > 120 ? `${cleanPrompt.slice(0, 120)}…` : cleanPrompt;

      await stepLogAction(
        {
          type: 'answered',
          channel: channelName,
          description: preview || 'Answered a community question',
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        },
        conversation,
        threadKey,
      );
    }
  }

  if (streamThreadId) {
    await stepEndStream(streamThreadId);
  }

  logger.info('Workflow completed', { success, responseLength: responseText.length });

  return {
    success,
    response: responseText,
  };
}
