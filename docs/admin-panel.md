# Admin panel

Server-rendered Next.js dashboard with real-time visibility into bot activity. Slack OAuth via Better Auth restricts access to workspace members. For the bot and workflow architecture, see [Architecture](architecture.md).

## Rendering

Pages are non-async. They render a static shell (header, sidebar, layout) immediately and delegate data fetching to async Server Components wrapped in `<Suspense>` boundaries with skeleton fallbacks. `cacheComponents` and React Compiler are both enabled.

Client Component hooks like `usePathname` and `useSession` are isolated in their own `<Suspense>`-wrapped components so they don't force the parent into dynamic rendering.

## Data layer

All data fetching lives in `data/queries/`. Every query:

- Enforces auth via `requireSession()`
- Deduplicates within a request via React `cache()`
- Returns exactly the data the page needs to render

`cacheComponents` preserves the rendered component tree across client navigations via React Activity. Conversation previews opened on the activity page stay expanded when you navigate back from a detail view.

Without Upstash Redis, queries fall back to `data/mock/` so the panel works without external services.

## Streaming

The workflow writes a stream entry to Redis when the bot starts processing and clears it when done. Client Components poll via SWR (`refreshInterval: 3000`) against authenticated GET routes (`/api/streams`, `/api/streams/[threadKey]`).

SWR handles deduplication, `keepPreviousData` to prevent flicker, and `revalidateOnFocus` for instant updates when tabbing back. A React context provider shares active thread keys across the activity page so the status card, activity card highlights, and conversation detail indicators all react to the same data.

## Async React patterns

- **`<ViewTransition>`**—animates Suspense reveals. Default crossfade on the dashboard, `slide-up`/`slide-down` on detail pages with `default="none"` to suppress unwanted update fades. Custom `@keyframes` defined in `globals.css`
- **`useTransition`**—activity filters, search, pagination, and conversation preview toggle wrap state updates in transitions to keep the UI responsive and activate ViewTransition animations
- **`useOptimistic`**—activity filters highlight the selected type instantly while the server re-renders the filtered list

## Search params

The activity page uses URL search params (`?type=`, `?q=`, `?limit=`) as the source of truth for filters, search, and pagination.

## Theming

Color tokens are CSS custom properties in oklch with light/dark variants (`app/globals.css`), registered as Tailwind colors via `@theme inline`. Charts reference the same tokens so they stay in sync across themes.

## Pages

| Page         | URL              | Description                                                           |
| ------------ | ---------------- | --------------------------------------------------------------------- |
| Overview     | `/`              | Stats, weekly trends, activity chart, recent activity, live bot status|
| Activity     | `/activity`      | Filterable timeline with search, pagination, and previews             |
| Conversation | `/activity/[id]` | Full conversation thread with markdown rendering                      |
| Settings     | `/settings`      | Read-only config values and channel overview with action counts       |
