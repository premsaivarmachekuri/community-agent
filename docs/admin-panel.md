# Admin Panel

Next.js implementation details for the admin dashboard. For the high-level overview, see [Architecture](architecture.md).

## Stack

- Server-rendered with shadcn/ui, Geist font, light/dark theme
- `cacheComponents` and React Compiler enabled — pages are non-async, maximizing the static shell
- Bot actions and full conversations stored in Upstash Redis (30-day TTL)
- Slack OAuth via Better Auth — only workspace members can sign in
- Falls back to mock data when Redis is not configured

## Pages

| Page         | URL              | Description                                                                           |
| ------------ | ---------------- | ------------------------------------------------------------------------------------- |
| Overview     | `/`              | Stats tiles with colored type icons, weekly trends, and clickable recent activity     |
| Activity     | `/activity`      | Timeline with type filters, text search, pagination, and inline conversation previews |
| Conversation | `/activity/[id]` | Full conversation thread with markdown rendering                                      |

The activity page supports `?type=answered`, `?q=search`, and `?limit=40` search params. Stat tiles on the overview link directly to filtered activity views.

## Live streaming

Client components poll Redis for active streams every 3 seconds. New conversations get a standalone streaming card; follow-up messages in existing threads highlight the existing activity card with a green ring instead. The overview page shows how many conversations the bot is handling, and the conversation detail page shows a "Bot is responding..." indicator. When streams end, `startTransition` batches the cleanup with `router.refresh()` so stats and action lists update seamlessly via ViewTransition.

## Activity filters and search

Type filter buttons (All, Answered, Routed, etc.) with colored dots and count badges. Uses `useOptimistic` + `startTransition` for instant feedback. The `searchParams` promise is passed to the async `ActivityList` inside `<Suspense>` while the page component stays non-async. A debounced text search input updates the `q` search param.

## Pagination

Shows 20 actions at a time with a "Show more" button that increments via the `limit` search param. Uses `router.push` with `{ scroll: false }` to preserve scroll position.

## Inline conversation preview

Answered actions have a collapsible preview that lazily fetches messages via a server action. Uses a React context provider to split the toggle button (in the action row) from the expandable content (below the row), preventing layout shift.

## Visual design

Each action type has a distinct icon color (blue/orange/green/purple/red) and tinted background circle, defined in a shared `typeConfig`. This is consistent across stat tiles, activity cards, recent activity items, and filter buttons. Stat tiles show "+N this week" trend indicators. Timestamps display as relative time ("2m ago", "3h ago") with auto-refresh intervals.

## Key files

| File                                  | Role                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `app/(dashboard)/page.tsx`            | Overview page — stats tiles with trends, recent activity links                           |
| `app/(dashboard)/activity/page.tsx`   | Activity page — filters, search, paginated list, inline previews                         |
| `app/(dashboard)/activity/[id]/`      | Conversation detail page with error boundary                                             |
| `data/actions/stream.ts`              | Server Actions for polling active streams — annotates each with `isFollowUp`             |
| `data/actions/conversation.ts`        | Server Action for lazily fetching conversation previews                                  |
| `components/ActivityFilters.tsx`      | Filter buttons with colored dots, counts, `useOptimistic` + `startTransition`            |
| `components/ActivitySearch.tsx`       | Debounced search input that updates the `q` search param                                 |
| `components/ConversationPreview.tsx`  | Collapsible inline conversation preview using React context (provider, toggle, content)  |
| `components/ShowMoreButton.tsx`       | "Show more" pagination button, updates `limit` search param with `scroll: false`         |
| `components/FormattedTime.tsx`        | Client component — relative time display with auto-refresh intervals                     |
| `components/ActiveStreams.tsx`        | Live streaming cards for new conversations — follow-ups highlight existing cards instead |
| `components/ActiveStreamsContext.tsx` | React context sharing active threadKeys between streaming and activity card components   |
| `components/ActivityCardGlow.tsx`     | Thin client wrapper that applies a green ring to activity cards with active streams      |
| `components/LiveStreamIndicator.tsx`  | "Bot is responding..." indicator inside conversation detail pages                        |
| `components/DashboardLive.tsx`        | Active conversation count banner on the overview page — refreshes stats on completion    |
