# Admin Panel

Frontend architecture and design decisions for the Next.js admin dashboard. For the bot and workflow architecture, see [Architecture](architecture.md).

## Rendering strategy

Every page component is **non-async**. Data-fetching server components (activity lists, channel overviews) are placed inside `<Suspense>` boundaries so the static shell streams instantly and dynamic content fills in. `cacheComponents` and React Compiler are both enabled.

The `searchParams` promise is passed directly to the async child — the page itself never awaits it. This keeps the outer layout and header in the static shell.

## Data layer

All data fetching lives in `data/queries/`. Each query calls `requireSession()` before touching the store, so auth is enforced at the data layer regardless of which page or server action triggers it.

Analytics data uses `'use cache: remote'` with `cacheLife('days')` — bucketed once per day, not on every request. The bucketing logic (grouping actions into calendar-day bins) also lives in the data layer, not in the page component.

When Upstash Redis is not configured, queries fall back to the mock dataset in `data/mock/`. The entire panel remains functional with realistic sample data so you can develop the UI without external services.

## Search params and filtering

The activity page uses URL search params (`?type=`, `?q=`, `?limit=`) as the source of truth for filters, search, and pagination. Filter changes use `useOptimistic` + `startTransition` for instant UI feedback while the server re-renders. Both filters and search reset pagination when changed. "Show more" increments via the `limit` param with `router.push({ scroll: false })` to preserve scroll position.

## Conversation previews

Answered actions expand inline to show the conversation thread. A React context provider splits the toggle button (in the action row) from the expandable content (below the row) so they can live in separate DOM positions without prop drilling. Messages are fetched lazily via a server action on first expand.

## Live streaming

Client components poll Redis for active streams every 3 seconds. New conversations get a standalone streaming card; follow-up messages in existing threads highlight the existing activity card with a ring and an absolutely-positioned "Bot is responding..." indicator (no layout shift). All streaming state is managed locally. Server-rendered data refreshes naturally on navigation.

## Theming

Action types each have a CSS custom property (`--type-answered`, `--type-routed`, etc.) defined in oklch with light/dark variants. These are registered as Tailwind colors in `@theme inline` so they work with opacity modifiers (`bg-type-answered/10`). Functional colors (`--success`, `--info`, `--destructive`) follow the same pattern. All color tokens live in `app/globals.css` — no hardcoded Tailwind color classes for semantic meanings.

Charts use `var(--type-*)` references directly so they stay in sync with the rest of the UI across themes.

## Charts

Analytics uses `recharts` with a stacked `AreaChart` (monotone curves, gradient fills). The chart is a client component that receives pre-bucketed data as props — no data fetching or transformation happens on the client. Date labels use `toLocaleDateString` for locale-aware formatting.

## Pages

| Page         | URL              | Description                                                     |
| ------------ | ---------------- | --------------------------------------------------------------- |
| Overview     | `/`              | Stats tiles, weekly trends, recent activity, live bot count     |
| Activity     | `/activity`      | Filterable timeline with search, pagination, and previews       |
| Conversation | `/activity/[id]` | Full conversation thread with markdown rendering                |
| Analytics    | `/analytics`     | Stacked area chart and breakdown by type                        |
| Settings     | `/settings`      | Read-only config values and channel overview with action counts |
