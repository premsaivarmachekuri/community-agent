# Admin Panel

Next.js implementation details for the admin dashboard. For the high-level overview, see [Architecture](architecture.md).

## Stack

- Server-rendered with shadcn/ui, Geist font, light/dark theme
- `cacheComponents` and React Compiler enabled — pages are non-async, maximizing the static shell
- Bot actions and full conversations stored in Upstash Redis (30-day TTL)
- Slack OAuth via Better Auth — only workspace members can sign in
- Data-layer auth via `requireSession()` in every query and server action (defense-in-depth)
- Falls back to mock data when Redis is not configured

## Pages

| Page         | URL              | Description                                                                           |
| ------------ | ---------------- | ------------------------------------------------------------------------------------- |
| Overview     | `/`              | Stats tiles with colored type icons, weekly trends, and clickable recent activity     |
| Activity     | `/activity`      | Timeline with type filters, text search, pagination, and inline conversation previews |
| Conversation | `/activity/[id]` | Full conversation thread with markdown rendering                                      |
| Analytics    | `/analytics`     | Activity trend line chart and breakdown by type with progress bars                    |
| Settings     | `/settings`      | Read-only bot configuration and channel overview with per-channel action counts       |

### Overview

Stats tiles derived from `getRecentActions()` — same data source the activity page uses, so counts always match. Each tile links to the activity page pre-filtered by type. A "Recent Activity" card shows the last 4 actions with links to detail views. The `DashboardLive` component shows how many conversations the bot is actively handling.

### Activity

shadcn `ToggleGroup` filter buttons (All, Answered, Routed, etc.) with colored dots and count badges. Uses `useOptimistic` + `startTransition` for instant feedback. The `searchParams` promise is passed to the async `ActivityList` inside `<Suspense>` while the page component stays non-async. A debounced text search input updates the `q` search param. Both filters and search reset pagination when changed.

Shows 20 actions at a time with a "Show more" button that increments via the `limit` search param. Uses `router.push` with `{ scroll: false }` to preserve scroll position.

Answered actions have a collapsible conversation preview that lazily fetches messages via a server action. Uses a React context provider to split the toggle button (in the action row) from the expandable content (below the row), preventing layout shift.

The activity page supports `?type=answered`, `?q=search`, and `?limit=40` search params.

### Analytics

Uses `recharts` to visualize activity trends. A `LineChart` (not stacked `AreaChart` — stacking made low-count types appear visually dominant) shows one line per action type at its actual value. The date range adapts to the data — buckets span from the earliest action to today, aligned to calendar-day boundaries via `startOfDay()`. Below the chart, a "Breakdown by Type" card shows each type with a colored icon, progress bar, count, and percentage, sorted by count descending.

Data is fetched and bucketed via `getAnalyticsData()` in the data layer (`data/queries/actions.ts`), cached with `'use cache: remote'` and `cacheLife('days')`. `AnalyticsContent` passes the pre-bucketed result as props to `AnalyticsChart` (client component).

### Settings

Two sections: configuration and channel overview.

The configuration section displays read-only values from `lib/config.ts` — AI model, Slack workspace URL, knowledge base URL, and search domains. URLs are clickable external links; unconfigured values show "Not configured."

The channel overview lists all channels from `lib/channels.ts` with descriptions, topic badges (the same `topics` array the routing tool uses), a "Welcome" badge for the welcome channel, and a count of recent actions per channel. Channel names link to the activity page pre-filtered by channel. Wrapped in `<Suspense>` since it fetches action counts from `getRecentActions()`.

## Live streaming

Client components poll Redis for active streams every 3 seconds. New conversations get a standalone streaming card; follow-up messages in existing threads highlight the existing activity card with a green ring instead. The overview page shows how many conversations the bot is handling, and the conversation detail page shows a "Bot is responding..." indicator. When streams end, `startTransition` batches the cleanup with `router.refresh()` so stats and action lists update seamlessly via ViewTransition.

## Visual design

Each action type has a distinct icon color (blue/orange/green/purple/red) and tinted background circle, defined in a shared `typeConfig`. This is consistent across stat tiles, activity cards, recent activity items, filter buttons, analytics charts, and type breakdown bars. Stat tiles show "+N this week" trend indicators. Timestamps display as relative time ("2m ago", "3h ago") with auto-refresh intervals.
