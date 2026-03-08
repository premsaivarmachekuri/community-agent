import { Suspense } from 'react';
import { BookOpen, Bot, ExternalLink, Globe, Hash, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { config } from '@/lib/config';
import { channels } from '@/lib/channels';
import { getChannelCounts } from '@/data/queries/activity';

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" description="Bot configuration and channels" />
      <div className="flex-1 space-y-6 p-6">
        <ConfigSection />
        <Suspense fallback={<ChannelsSkeleton />}>
          <ChannelOverview />
        </Suspense>
      </div>
    </>
  );
}

function ConfigSection() {
  const items = [
    {
      icon: Bot,
      label: 'AI Model',
      value: config.model,
    },
    {
      icon: MessageSquare,
      label: 'Slack Workspace',
      value: config.slackWorkspaceUrl || null,
      href: config.slackWorkspaceUrl || undefined,
    },
    {
      icon: BookOpen,
      label: 'Knowledge Base',
      value: config.savoirApiUrl ? config.savoirApiUrl.replace(/^https?:\/\//, '') : null,
      href: config.savoirApiUrl || undefined,
    },
    {
      icon: Globe,
      label: 'Search Domains',
      value: config.searchDomains.length > 0 ? config.searchDomains.join(', ') : null,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <dt className="min-w-[120px] text-sm font-medium">{item.label}</dt>
              <dd className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {item.value ? (
                  item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-info hover:underline"
                    >
                      {item.value}
                      <ExternalLink className="ml-1 inline h-3 w-3" />
                    </a>
                  ) : (
                    <span className="font-mono text-xs">{item.value}</span>
                  )
                ) : (
                  <span className="italic text-muted-foreground/60">Not configured</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

async function ChannelOverview() {
  const channelCounts = await getChannelCounts();
  const channelEntries = Object.entries(channels);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Channels</CardTitle>
      </CardHeader>
      <CardContent>
        {channelEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No channels configured.</p>
        ) : (
          <div className="divide-y">
            {channelEntries.map(([key, ch]) => {
              const count = channelCounts[key] || 0;
              return (
                <div key={key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/activity?q=${encodeURIComponent(ch.name)}` as any}
                        className="text-sm font-medium hover:underline"
                      >
                        #{ch.name}
                      </Link>
                      {ch.isWelcomeChannel && (
                        <Badge variant="secondary" className="text-[10px]">
                          Welcome
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{ch.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {ch.topics.map((topic) => (
                        <Badge key={topic} variant="outline" className="text-[10px] font-normal">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                    {count} {count === 1 ? 'action' : 'actions'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChannelsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-20" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
