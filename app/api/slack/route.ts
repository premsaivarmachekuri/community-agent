import { chat } from '@/lib/chat';
import { handleMemberJoined } from '@/lib/welcome';
import { after } from 'next/server';

export async function POST(request: Request) {
  const clone = request.clone();

  try {
    const body = await clone.json();

    if (body?.type === 'url_verification') {
      return Response.json({ challenge: body.challenge });
    }

    if (body?.event?.type === 'member_joined_channel') {
      after(() =>
        handleMemberJoined({
          user: body.event.user,
          channel: body.event.channel,
        }),
      );
    }
  } catch {
    // Body parse failed — fall through to Chat SDK
  }

  return chat.webhooks.slack(request, { waitUntil: (p) => after(() => p) });
}
