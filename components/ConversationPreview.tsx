'use client';

import { createContext, useContext, useState, useTransition } from 'react';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { fetchConversationPreview } from '@/data/actions/conversation';
import type { ConversationMessage } from '@/lib/types';
import { cn, cleanSlackText, stripMarkdown } from '@/lib/utils';

type PreviewState = {
  isOpen: boolean;
  messages: ConversationMessage[] | null;
  isPending: boolean;
  toggle: () => void;
};

const PreviewContext = createContext<PreviewState | null>(null);

export function ConversationPreviewProvider({
  actionId,
  children,
}: {
  actionId: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[] | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!isOpen && !messages) {
      startTransition(async () => {
        const result = await fetchConversationPreview(actionId);
        setMessages(result);
        setIsOpen(true);
      });
    } else {
      setIsOpen(!isOpen);
    }
  }

  return (
    <PreviewContext value={{ isOpen, messages, isPending, toggle }}>{children}</PreviewContext>
  );
}

export function ConversationPreviewToggle() {
  const ctx = useContext(PreviewContext);
  if (!ctx) return null;
  const { isOpen, isPending, toggle } = ctx;

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Hide conversation preview' : 'Show conversation preview'}
      className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
    >
      <MessageCircle className="h-3 w-3" />
      {isPending ? 'Loading...' : isOpen ? 'Hide' : 'Preview'}
      {!isPending &&
        (isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
    </button>
  );
}

export function ConversationPreviewContent() {
  const ctx = useContext(PreviewContext);
  if (!ctx || !ctx.isOpen || !ctx.messages) return null;
  const { messages } = ctx;

  if (messages.length === 0) {
    return <p className="text-xs text-muted-foreground">No conversation recorded.</p>;
  }

  return (
    <div className="divide-y rounded-md border bg-muted/30">
      {messages.slice(0, 4).map((msg, i) => {
        const cleaned = stripMarkdown(cleanSlackText(msg.content));
        const truncated = cleaned.length > 200 ? `${cleaned.slice(0, 200)}...` : cleaned;
        return (
          <div key={i} className="flex gap-2 px-3 py-2 text-xs">
            <span
              className={cn(
                'shrink-0 font-medium',
                msg.role === 'assistant' ? 'text-blue-600 dark:text-blue-400' : 'text-foreground',
              )}
            >
              {msg.role === 'assistant' ? 'Bot' : 'User'}
            </span>
            <span className="text-muted-foreground">{truncated}</span>
          </div>
        );
      })}
      {messages.length > 4 && (
        <div className="px-3 py-1.5 text-xs text-muted-foreground/60">
          +{messages.length - 4} more messages
        </div>
      )}
    </div>
  );
}
