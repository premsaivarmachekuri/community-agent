# Community Agent Template

AI-powered Slack community management bot with a built-in Next.js admin panel. Uses Chat SDK, AI SDK, and Vercel Workflow.

**Template.** Fork it, customize it, and deploy your own AI community manager with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fcommunity-agent-template&env=COMMUNITY_NAME,BETTER_AUTH_SECRET,SLACK_CLIENT_ID,SLACK_CLIENT_SECRET,SLACK_TEAM_ID&envDescription=COMMUNITY_NAME%3A%20Name%20in%20bot%20responses%20%7C%20BETTER_AUTH_SECRET%3A%20Run%20%60openssl%20rand%20-base64%2032%60%20%7C%20SLACK_CLIENT_ID%20%26%20SLACK_CLIENT_SECRET%3A%20From%20Slack%20app%20Basic%20Information%20%7C%20SLACK_TEAM_ID%3A%20Workspace%20ID.%20Add%20AI%20keys%20after%20deploy.&envLink=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fcommunity-agent-template%23configure-environment-variables&project-name=community-agent&repository-name=community-agent&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22turso%22%7D%5D)

## Features

- **Community Manager AI** — Bot with a community manager persona that routes questions, welcomes members, surfaces unanswered threads, and flags tricky issues to a community lead
- **Channel-Aware Routing** — Configurable channel map so the bot knows your workspace layout and where to send people
- **Durable Workflows** — Every LLM call and tool execution is a checkpoint with automatic retries via [Vercel Workflow](https://vercel.com/docs/workflow)
- **Web Search** — Built-in web search via OpenAI's native search tool (or Perplexity via AI Gateway if your team allows it)
- **AI Gateway** — Model switching and fallbacks through the Vercel AI Gateway
- **Sandbox Execution** — Optional bash/bash_batch tools via Savoir SDK for running code in a sandboxed environment
- **Native Slack UI** — Shows typing indicator while processing, replies in threads
- **Admin Panel** — Dashboard with activity feed, stats, and full conversation history; Slack OAuth via Better Auth (only workspace members can sign in). New activities glow and are badged with "New" since your last visit
- **Lead Flagging** — Bot can escalate tricky issues to a community lead via Slack DM

## Deploy

### Quick Start (admin panel only)

Try the admin panel without setting up Slack:

1. Import the repo on [vercel.com/new](https://vercel.com/new)
2. Add a `COMMUNITY_NAME` env var (e.g. `DevHub`)
3. Deploy — the dashboard works immediately with mock data
4. **Optional:** Add Upstash Redis from the **Storage** tab to enable real data logging, then test with:

```bash
curl -X POST https://your-app.vercel.app/api/test-action
```

### Full Setup (Slack bot + admin panel)

#### 1. Create Slack App

Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From a manifest**.

Paste this manifest (replace `your-app.vercel.app` with your deployed URL):

```json
{
  "display_information": {
    "name": "Community Agent",
    "description": "AI-powered community manager",
    "background_color": "#000000"
  },
  "features": {
    "bot_user": {
      "display_name": "Community Agent",
      "always_online": true
    }
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "app_mentions:read",
        "assistant:write",
        "channels:history",
        "channels:join",
        "channels:read",
        "chat:write",
        "emoji:read",
        "groups:history",
        "im:history",
        "reactions:read",
        "search:read.public",
        "search:read.users",
        "users.profile:read",
        "users:read"
      ]
    }
  },
  "settings": {
    "event_subscriptions": {
      "request_url": "https://your-app.vercel.app/api/slack",
      "bot_events": [
        "app_mention",
        "member_joined_channel",
        "message.channels",
        "message.groups",
        "message.im"
      ]
    },
    "org_deploy_enabled": false,
    "socket_mode_enabled": false,
    "token_rotation_enabled": false
  }
}
```

After creating:

1. Go to **App Home** in the left sidebar → enable **Messages Tab** → check **"Allow users to send Slash commands and messages from the messages tab"**
2. Click **Install App** in the left sidebar → **Install to Workspace** → authorize
3. Copy the **Bot User OAuth Token** (`xoxb-...`) from OAuth & Permissions
4. Copy the **Signing Secret** from Basic Information (click Show)

> **Tip:** Create a free test workspace at [slack.com/create](https://slack.com/create) to experiment safely. Add channels matching the template defaults (`#help`, `#bugs`, `#introductions`) and install the bot there.

#### 2. Configure Environment Variables

Add these in your Vercel project settings (or `.env.local` for local dev):

| Variable                   | Required  | Description                                                                                                   |
| -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `SLACK_BOT_TOKEN`          | For Slack | Bot token from your Slack app (`xoxb-...`)                                                                    |
| `SLACK_SIGNING_SECRET`     | For Slack | Signing secret from Slack app settings                                                                        |
| `REDIS_URL`                | For Slack | Redis for conversation state (`redis://...`)                                                                  |
| `ANTHROPIC_API_KEY`        | For AI    | Anthropic API key from [console.anthropic.com](https://console.anthropic.com/settings/keys)                   |
| `OPENAI_API_KEY`           | For AI    | OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys) (alternative to Anthropic)    |
| `COMMUNITY_NAME`           | No        | Name shown in bot responses (default: "Your Community")                                                       |
| `AI_MODEL`                 | No        | AI model (default: `anthropic/claude-sonnet-4-20250514`). For OpenAI: `openai/gpt-4o-mini`                    |
| `UPSTASH_REDIS_REST_URL`   | No        | Upstash Redis REST URL (or use `KV_REST_API_URL` from Vercel Marketplace)                                     |
| `UPSTASH_REDIS_REST_TOKEN` | No        | Upstash Redis REST token (or use `KV_REST_API_TOKEN` from Vercel Marketplace)                                 |
| `SLACK_WORKSPACE_URL`      | No        | Slack workspace URL — adds an "Open Slack" link to the admin panel                                            |
| `AI_GATEWAY_API_KEY`       | No        | AI Gateway API key (auto-authenticated on Vercel via OIDC)                                                    |
| `SAVOIR_API_URL`           | No        | [Savoir](https://github.com/vercel-labs/knowledge-agent-template) API URL for sandboxed bash execution        |
| `SAVOIR_API_KEY`           | No        | Savoir API key (if the instance requires auth)                                                                |
| `SEARCH_DOMAINS`           | No        | Comma-separated domains to focus web searches on (e.g. `docs.example.com,partner.com`). Used in system prompt |
| `COMMUNITY_LEAD_SLACK_ID`  | No        | Slack user ID — bot can escalate tricky issues via DM                                                         |
| `BETTER_AUTH_SECRET`       | Yes       | Secret for admin panel auth sessions (min 32 chars). Generate with `openssl rand -base64 32`                  |
| `SLACK_CLIENT_ID`          | Yes       | Slack app Client ID (Basic Information → App Credentials)                                                     |
| `SLACK_CLIENT_SECRET`      | Yes       | Slack app Client Secret (same location)                                                                       |
| `SLACK_TEAM_ID`            | Yes       | Slack workspace ID (`T...`) — restricts admin sign-in to workspace members                                    |
| `TURSO_DATABASE_URL`       | For prod  | Turso database URL (`libsql://...`). Defaults to `file:local.db` for local dev                                |
| `TURSO_AUTH_TOKEN`         | For prod  | Turso auth token (from Vercel Turso integration or [turso.tech](https://turso.tech))                          |

#### 3. Set up Vercel Storage

The app uses two databases. Set both up from the Vercel **Storage** tab — env vars are added to your project automatically.

**Turso (auth sessions):**

1. Go to your Vercel project → **Storage** tab → **Create Database** → **[Turso](https://turso.tech/)**
2. Auto-populates `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
3. Create the auth tables — run `npx auth@latest migrate` locally, or use the Turso dashboard SQL console. See the [Better Auth migration docs](https://www.better-auth.com/docs/concepts/database#running-migrations) for details.
4. For local dev, no setup needed — defaults to `file:local.db`

**Upstash Redis (bot action logging):**

1. Go to **Storage** tab → **Create Database** → **Upstash Redis**
2. Auto-populates env vars. The app only needs **two of them**:

| Vercel Marketplace variable   | Equivalent `UPSTASH_*` name | Used?                                                    |
| ----------------------------- | --------------------------- | -------------------------------------------------------- |
| `KV_REST_API_URL`             | `UPSTASH_REDIS_REST_URL`    | **Yes** — set one or the other                           |
| `KV_REST_API_TOKEN`           | `UPSTASH_REDIS_REST_TOKEN`  | **Yes** — set one or the other                           |
| `KV_REST_API_READ_ONLY_TOKEN` | —                           | No (app needs write access)                              |
| `KV_URL`                      | —                           | No                                                       |
| `REDIS_URL`                   | —                           | No (this is for conversation state, not the admin panel) |

Without Upstash Redis, the admin panel shows mock data — everything else still works.

Pull env vars locally after setup: `vercel link && vercel env pull .env.local`

#### 4. Set up Slack OAuth for Admin Panel

The admin panel uses Slack OAuth — only members of your workspace can sign in. This reuses the same Slack app you created in step 1.

1. Go to your Slack app → **Basic Information** → **App Credentials**
2. Copy the **Client ID** and **Client Secret**
3. Go to **OAuth & Permissions** → **Redirect URLs** → add `https://<your-production-domain>/api/auth/callback/slack`
4. Find your **Workspace ID** (starts with `T`) — visible in the browser URL when using Slack: `app.slack.com/client/T.../...`
5. Add these env vars to your Vercel project (make sure to include the **Production** environment):
   - `SLACK_CLIENT_ID` — Client ID from step 2
   - `SLACK_CLIENT_SECRET` — Client Secret from step 2
   - `SLACK_TEAM_ID` — Workspace ID from step 4
   - `BETTER_AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `BETTER_AUTH_URL` — your production domain URL (e.g. `https://your-app.vercel.app`)

> **Important:** Use your **production domain** — not a branch deployment URL (e.g. `git-main` variants). Branch URLs are preview deployments and may interfere with OAuth callbacks. Check **Settings → Domains** for the correct URL.
>
> **Local dev:** Add `http://localhost:3000/api/auth/callback/slack` as a second redirect URL in the Slack app. Set `BETTER_AUTH_URL=http://localhost:3000` in `.env.local`.

#### 5. Configure Channels

Edit `lib/channels.ts` to match your Slack workspace. These map to **existing channels** — the bot does not create them.

```ts
export const channels: Record<string, ChannelConfig> = {
  help: {
    name: 'help',
    description: 'Get help with questions and issues',
    topics: ['questions', 'support', 'troubleshooting'],
  },
  introductions: {
    name: 'introductions',
    description: 'New members introduce themselves',
    topics: ['introductions', 'new members'],
    isWelcomeChannel: true,
  },
  // Add your channels here...
};
```

Then **invite the bot** to each channel so it can read messages and post replies:

```
/invite @Community Agent
```

Run this in every channel listed in your config. The bot can't scan for unanswered questions or post welcome messages in channels it hasn't been invited to.

#### 6. Deploy

```bash
vercel
```

After deploying, go to your Slack app → **Event Subscriptions** → set the Request URL to `https://<your-production-domain>/api/slack` and verify it shows a green checkmark.

> **Note:** Vercel Deployment Protection may block Slack webhooks and OAuth callbacks. If the bot or auth isn't working, check your protection settings.

**Testing the bot:**

| What to try      | How                                                                                                 | Example response                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Channel routing  | `@Community Agent I found a security vulnerability in the API, the auth tokens are being logged in` | "It sounds like this is a serious issue with potential security implications. I recommend reporting this in the #bugs channel so that it can be addressed by the right team."                 |
| Channel routing  | `@Community Agent how do I set up Vercel Workflow?`                                                 | "It looks like your question about setting up Vercel Workflow would fit best in the #help channel, as it's related to getting support."                                                       |
| Flag to lead     | `@Community Agent someone is being rude in #help, can you get a human to look at it?`               | "I've flagged the rudeness issue in the channel to a community lead. They'll take a look at it. Thanks for bringing it to my attention!" (bot DMs the lead)                                   |
| Web search       | `@Community Agent what's the latest on Next.js 16 caching?`                                         | "Next.js 16 introduces significant updates to caching mechanisms. Key features include: 1. Caching Profiles..." (searches via OpenAI web search, guided by `SEARCH_DOMAINS` in system prompt) |
| Unanswered scan  | `@Community Agent are there any unanswered questions in #help?`                                     | "There are no unanswered questions in the #help channel in the last 24 hours!" (or lists threads that need attention)                                                                         |
| Thread follow-up | Reply in the thread: `thanks, where can I report a bug?`                                            | "You can report bugs in the #bugs channel." (maintains conversation context)                                                                                                                  |
| Trigger welcome  | Join `#introductions`                                                                               | Bot posts a welcome message with a channel guide                                                                                                                                              |
| DM the bot       | Send a direct message                                                                               | Bot responds as a community manager with general help                                                                                                                                         |

Each action is logged to the admin panel — check the dashboard to see stats and activity update in real time.

## Customization

### System Prompt

Edit `lib/agent.ts` to customize the bot's personality and behavior.

### Channels

Edit `lib/channels.ts` to define your workspace channels, their purposes, and routing topics.

### Knowledge Base (Savoir)

This template is designed to work alongside the [Knowledge Agent Template](https://github.com/vercel-labs/knowledge-agent-template). That template provides a deployed Savoir backend where you upload your community docs (FAQs, rules, guides, etc.). This template connects to it via `SAVOIR_API_URL`, giving the bot `bash` and `bash_batch` tools to search and read those files remotely (`grep`, `cat`, `find`, etc.).

The two templates are independent — this one handles the Slack bot and admin panel, the Knowledge Agent Template handles the knowledge base. Without `SAVOIR_API_URL`, the bot still works using web search, channel routing, and the system prompt. With it, the bot can also answer questions from your own documentation.

### Tools

Add or modify agent tools in `workflows/agent-workflow/tools.ts`.

## Architecture

The app has two halves: a **Slack bot** and an **admin panel**, both in a single Next.js deployment.

**Slack bot flow:**

```
Slack message → Chat SDK (receive & route) → Vercel Workflow (durable) → AI SDK (think & generate) → Chat SDK (reply to Slack)
```

Three layers work together:

- **[Chat SDK](https://chat-sdk.dev)** — the messaging layer. Receives Slack webhook events, manages conversation threads, stores history in Redis, sends replies, shows typing indicators. It's the bot's "mouth and ears." Supports multiple platforms (Slack, Discord) so the same AI logic can be reused with a different adapter.
- **[AI SDK](https://ai-sdk.dev)** — the AI layer. Sends prompts to the model (Claude, GPT, etc.), streams responses, handles tool calls. It's the bot's "brain." Doesn't know anything about Slack — just does LLM calls.
- **[Vercel Workflow](https://vercel.com/docs/workflow)** — the durability layer. Wraps AI SDK calls in durable steps with automatic retries and checkpoints. If a long response fails halfway, it picks up where it left off instead of starting over.

Tools (`suggest_channel`, `unanswered`, `bash`, `bash_batch`, `web_search`, `flag_to_lead`) run as durable steps inside the workflow. Welcome messages for new members are handled directly in the route (no workflow needed).

**Admin panel:**

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
| `workflows/agent-workflow/tools.ts` | Agent tools (`bash`, `bash_batch`, `suggest_channel`, `unanswered`, `web_search`, `flag_to_lead`) |

**How the bot works:**

| File                                | Role                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/api/slack/route.ts`            | Slack webhook entry point — routes events to Chat SDK, handles `member_joined_channel` for welcome messages                                      |
| `lib/chat.ts`                       | Chat SDK setup — receives mentions, manages threads (format: `slack:CHANNEL_ID:THREAD_TS`), fetches history, starts the workflow fire-and-forget |
| `workflows/agent-workflow/index.ts` | Durable workflow — runs DurableAgent, posts response to Slack, logs the action with conversation                                                 |
| `workflows/agent-workflow/steps.ts` | Individual durable steps (`'use step'` directive) — post to Slack, resolve channel names, log actions                                            |
| `lib/config.ts`                     | Centralized env var config (`COMMUNITY_NAME`, `AI_MODEL`, `SAVOIR_API_URL`, etc.)                                                                |
| `lib/store.ts`                      | Upstash Redis store — writes/reads bot actions, stats, and conversations                                                                         |
| `lib/logger.ts`                     | Structured logger — outputs to console (visible in Vercel dashboard)                                                                             |

> **Workflow constraint:** Files using `'use step'` or `'use workflow'` must live inside the `workflows/` directory for the bundler to process them. Node.js-only packages (like `@slack/web-api`) must be dynamically imported inside step functions — they can't be used at the workflow top level.

## Testing Without Slack

The `/api/test-action` endpoint lets you simulate bot actions (requires Upstash Redis env vars and an authenticated session). Sign in to the admin panel first, then use the endpoint from the browser console or a tool that forwards your session cookie:

```bash
curl -X POST http://localhost:3000/api/test-action -b "better-auth.session_token=YOUR_SESSION_TOKEN"
```

Each call logs a random action (answered, routed, welcomed, surfaced, or flagged) and returns the logged entry as JSON. Answered actions include a test conversation thread — click the **Conversation** button on the activity page to view it.

To clear all stored data (useful after initial testing or when upgrading):

```bash
curl -X DELETE http://localhost:3000/api/test-action -b "better-auth.session_token=YOUR_SESSION_TOKEN"
```

Open any admin panel page to see the result:

| Page         | URL              | What updates                                                          |
| ------------ | ---------------- | --------------------------------------------------------------------- |
| Overview     | `/`              | Stats counters (answered, routed, welcomed, surfaced, flagged, total) |
| Activity     | `/activity`      | New entry in the timeline                                             |
| Conversation | `/activity/[id]` | Full conversation thread (for answered actions)                       |

The header auto-refreshes every 30 seconds — hover the **Check now** button to see the interval, or click it to refresh immediately.

**Without Redis:** Comment out the Upstash env vars and the admin panel falls back to mock data, including mock conversations for three sample actions.

## Built With

- [Next.js 16](https://nextjs.org) — React framework with cacheComponents and React Compiler
- [Chat SDK](https://chat-sdk.dev) — Slack adapter and bot framework
- [AI SDK 6](https://ai-sdk.dev) — AI model integration with AI Gateway support
- [Vercel Workflow](https://vercel.com/docs/workflow) — Durable workflow execution
- [Savoir SDK](https://github.com/vercel-labs/knowledge-agent-template) — Sandboxed bash execution (optional)
- [Better Auth](https://www.better-auth.com) — Slack OAuth for the admin panel
- [shadcn/ui](https://ui.shadcn.com) — Component library
- [Upstash Redis](https://upstash.com) — Bot action logging, stats, and conversation storage

## License

MIT
