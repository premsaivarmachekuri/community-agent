# Sprint — Remote Job Readiness Agent

Transform your profile into a personalized remote job action plan in minutes. Upload your profile, answer a quick intake form, and get an AI-powered analysis with your 7-day execution roadmap.

**For Job Seekers.** Get your profile audited, find target companies, and launch a personalized outreach campaign—all in one session.

## Features

- **Gap Audit**—AI analyzes your profile across 5 dimensions: project quality, async communication, tooling expertise, proof of work, and startup fit. Gets your overall job-readiness score.
- **Company Research**—automatically researches and recommends 5-10 target startups matched to your tech stack and goals, with hiring signals and relevance explained.
- **Cold Email Generator**—creates personalized email templates for each company, pulling details from company research to make each outreach feel genuine.
- **7-Day Sprint Plan**—day-by-day action plan with concrete, completable tasks: GitHub optimization, deployment, open source contributions, documentation, and outreach.
- **Live Agent Thinking**—stream agent reasoning in real-time as it analyzes your profile, researches companies, and builds your plan.
- **Clean UI**—Y Combinator-inspired minimal design with simple forms, readable reports, and downloadable plans. Built with [shadcn/ui](https://ui.shadcn.com) and Tailwind.
- **AI-Powered**—Claude 3 Opus reasoning engine via [AI SDK](https://ai-sdk.dev) and [Vercel AI Gateway](https://vercel.com/docs/ai-gateway).

## Quick start

1. Clone or fork this repo
2. Install dependencies: `pnpm install`
3. Run locally: `pnpm dev`
4. Visit http://localhost:3000 to see the landing page
5. Fill out the intake form to generate a mock report

No environment variables are required to get started locally. To use the AI features, add `ANTHROPIC_API_KEY` to your `.env.local`.

## Customization

| What to change  | File                                                      | Details                                   |
| --------------- | --------------------------------------------------------- | ----------------------------------------- |
| Intake form fields | [`app/page.tsx`](app/page.tsx)                      | User profile data collection             |
| Agent system prompt | [`lib/agent.ts`](lib/agent.ts)                      | Job readiness analysis instructions      |
| Report output structure | [`lib/types.ts`](lib/types.ts)                  | Gap audit, companies, sprint plan types  |
| Workflow steps | [`workflows/job-readiness/steps.ts`](workflows/job-readiness/steps.ts) | Agent analysis pipeline                  |
| Report display | [`app/report/page.tsx`](app/report/page.tsx)              | Tabs and layouts for results             |
| Design/theme | [`components/theme-provider.tsx`](components/theme-provider.tsx) | Dark/light mode and Tailwind config

## Built with

- [Next.js 16](https://nextjs.org)—App Router with React 19
- [AI SDK 6](https://ai-sdk.dev)—AI model integration with streaming and tool calling
- [Anthropic Claude](https://www.anthropic.com)—advanced reasoning for gap analysis
- [Vercel Workflow](https://vercel.com/docs/workflow)—durable, resumable job readiness processing
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)—model routing and rate limiting
- [shadcn/ui](https://ui.shadcn.com)—accessible component library
- [Tailwind CSS](https://tailwindcss.com)—utility-first styling
- [Geist Font](https://vercel.com/font)—clean, modern typography

## License

MIT
