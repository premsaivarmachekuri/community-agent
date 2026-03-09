# Admin Panel

The admin panel is a server-rendered Next.js dashboard that provides real-time visibility into the bot's activity. Slack OAuth via Better Auth restricts access to workspace members. For the bot and workflow architecture, see [Architecture](architecture.md).

## Rendering

Pages are non-async—they render a static shell (header, sidebar, layout) and delegate data fetching to async Server Components wrapped in `<Suspense>` boundaries. The static shell streams immediately while dynamic content fills in. `cacheComponents` and React Compiler are both enabled.

Client Component hooks like `usePathname` and `useSession` are isolated in their own `<Suspense>`-wrapped components so they don't force their parent into dynamic rendering.

## Data layer

All data fetching lives in `data/queries/`. Every query enforces auth via `requireSession()` and is wrapped with React `cache()` to deduplicate calls within a request. Page components call a single composite query that handles fetching, authorization, and aggregation—the page receives exactly the data it needs to render. `cacheComponents` preserves the rendered component tree across client navigations via React Activity, so conversation previews opened on the activity page stay expanded when navigating back from a detail view.

When Upstash Redis is not configured, queries fall back to `data/mock/` so the panel works without external services.

## Streaming

The workflow writes a stream entry to Redis when the bot starts processing a message and clears it when done. Client Components poll for active streams via SWR (`refreshInterval: 3000`) against GET API routes (`/api/streams`, `/api/streams/[threadKey]`). SWR handles deduplication, `keepPreviousData` to prevent flicker, and `revalidateOnFocus` for instant updates when tabbing back. A React context provider shares the set of active thread keys across the activity page so the status card, activity card highlights, and conversation detail indicators all react to the same data.

## Transitions

`<ViewTransition>` animates Suspense reveals—default crossfade on the dashboard, `slide-up`/`slide-down` on other pages with `default="none"` to suppress unwanted update fades.

## Search params

The activity page uses URL search params (`?type=`, `?q=`, `?limit=`) as the source of truth for filters, search, and pagination. Filter changes use `useOptimistic` + `startTransition` for instant UI feedback while the server re-renders.

## Theming

Color tokens are defined as CSS custom properties in oklch with light/dark variants (`app/globals.css`) and registered as Tailwind colors via `@theme inline`. Charts reference the same tokens so they stay in sync across themes.

## Pages

| Page         | URL              | Description                                                            |
| ------------ | ---------------- | ---------------------------------------------------------------------- |
| Overview     | `/`              | Stats, weekly trends, activity chart, recent activity, live bot status |
| Activity     | `/activity`      | Filterable timeline with search, pagination, and previews              |
| Conversation | `/activity/[id]` | Full conversation thread with markdown rendering                       |
| Settings     | `/settings`      | Read-only config values and channel overview with action counts        |
