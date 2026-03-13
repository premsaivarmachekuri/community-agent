import { after } from "next/server";
import { chat } from "@/lib/chat";

export async function POST(request: Request) {
  return chat.webhooks.slack(request, { waitUntil: (p) => after(() => p) });
}
