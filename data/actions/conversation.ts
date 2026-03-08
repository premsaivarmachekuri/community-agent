'use server';

import type { ConversationMessage } from '@/lib/types';
import { getConversation } from '@/data/queries/activity';
import { requireSession } from '@/data/queries/auth';

export async function fetchConversationPreview(actionId: string): Promise<ConversationMessage[]> {
  await requireSession();
  return getConversation(actionId);
}
