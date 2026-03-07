# Architecture

The app has two halves: a **Slack bot** and an **admin panel**, both in a single Next.js deployment.

## Slack bot flow

```
Slack message → Chat SDK (receive & route) → Vercel Workflow (durable) → AI SDK (think & generate) → Chat SDK (reply to Slack)
```

Three layers work together:

- **[Chat SDK](https://chat-sdk.dev)** — the messaging layer. Receives Slack webhook events, manages conversation threads, stores history in Redis, sends replies, shows typing indicators. It's the bot's "mouth and ears." Supports multiple platforms (Slack, Discord) so the same AI logic can be reused with a different adapter.
- **[AI SDK](https://ai-sdk.dev)** — the AI layer. Sends prompts to the model (Claude, GPT, etc.), streams responses, handles tool calls. It's the bot's "brain." Doesn't know anything about Slack — just does LLM calls.
- **[Vercel Workflow](https://vercel.com/docs/workflow)** — the durability layer. Wraps AI SDK calls in durable steps with automatic retries and checkpoints. If a long response fails halfway, it picks up where it left off instead of starting over.

## Tools

Tools (`suggest_channel`, `unanswered`, `bash`, `bash_batch`, `webSearch`, `webFetch`, `flag_to_lead`) run as durable steps inside the workflow. Less-used tools use Claude's `deferLoading` so only relevant tools are loaded into context. Welcome messages for new members are handled directly in the route (no workflow needed).

## Admin panel

- Server-rendered dashboard built with shadcn/ui, Geist font, light/dark theme
- `cacheComponents` and React Compiler enabled — pages are non-async, maximizing the static shell
- Bot actions and full conversations logged to Upstash Redis (30-day TTL)
- Slack OAuth via Better Auth — only workspace members can sign in
- Falls back to mock data when Redis is not configured — works out of the box

## Key Files

**Customize these:**

| File                                | Purpose                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `lib/agent.ts`                      | System prompt and personality                                                                     |
| `lib/channels.ts`                   | Channel map — must match your Slack workspace                                                     |
| `lib/welcome.ts`                    | Welcome message sent when members join                                                            |
| `lib/auth.ts`                       | Better Auth config — Slack OAuth for admin panel                                                  |
| `workflows/agent-workflow/tools.ts` | Agent tools (`suggest_channel`, `unanswered`, `bash`, `bash_batch`, `webSearch`, `webFetch`, `flag_to_lead`) |

**How the bot works:**

| File                                | Role                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/api/slack/route.ts`            | Slack webhook entry point — routes events to Chat SDK, handles `member_joined_channel` for welcome messages                                      |
| `lib/chat.ts`                       | Chat SDK setup — receives mentions, manages threads (format: `slack:CHANNEL_ID:THREAD_TS`), fetches history, starts the workflow fire-and-forget |
| `workflows/agent-workflow/index.ts` | Durable workflow — runs DurableAgent, posts response to Slack, logs the action with conversation                                                 |
| `workflows/agent-workflow/steps.ts` | Individual durable steps (`'use step'` directive) — post to Slack, resolve channel names, log actions                                            |
| `lib/config.ts`                     | Centralized env var config (`COMMUNITY_NAME`, `AI_MODEL`, `SAVOIR_API_URL`, etc.)                                                                |
| `lib/slack.ts`                      | Singleton Slack `WebClient` factory — used by Chat SDK and workflow steps                                                                        |
| `lib/savoir.ts`                     | Lightweight HTTP client for the Savoir sandbox API (`bash`, `bash_batch`)                                                                        |
| `lib/store.ts`                      | Upstash Redis store — writes/reads bot actions, stats, and conversations (indexed by action ID with sorted-set fallback)                         |
| `lib/logger.ts`                     | Structured logger — outputs to console (visible in Vercel dashboard)                                                                             |

> **Workflow constraint:** Files using `'use step'` or `'use workflow'` must live inside the `workflows/` directory for the bundler to process them. Node.js-only packages (like `@slack/web-api`) must be dynamically imported inside step functions — they can't be used at the workflow top level.
