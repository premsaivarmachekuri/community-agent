import { after } from "next/server";
import { chat } from "@/lib/chat";
import { createLogger } from "@/lib/logger";
import { handleMemberJoined } from "@/lib/welcome";

const logger = createLogger("slack-webhook");

export async function POST(request: Request) {
  const clone = request.clone();

  try {
    const body = await clone.json();

    if (body?.type === "url_verification") {
      return Response.json({ challenge: body.challenge });
    }

    if (body?.event?.type === "member_joined_channel") {
      after(() =>
        handleMemberJoined({
          user: body.event.user,
          channel: body.event.channel,
        })
      );
    }
  } catch (error) {
    logger.debug("Body parse failed, falling through to Chat SDK", { error });
  }

  return chat.webhooks.slack(request, { waitUntil: (p) => after(() => p) });
}
