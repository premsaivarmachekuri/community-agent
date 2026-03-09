'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DayBucket = {
  date: string;
  answered: number;
  routed: number;
  welcomed: number;
  surfaced: number;
  flagged: number;
};

const STACK_ORDER = ['flagged', 'surfaced', 'welcomed', 'routed', 'answered'] as const;

const COLORS: Record<string, string> = {
  answered: 'var(--type-answered)',
  routed: 'var(--type-routed)',
  welcomed: 'var(--type-welcomed)',
  surfaced: 'var(--type-surfaced)',
  flagged: 'var(--type-flagged)',
};

const LABELS: Record<string, string> = {
  answered: 'Answered',
  routed: 'Routed',
  welcomed: 'Welcomed',
  surfaced: 'Surfaced',
  flagged: 'Flagged',
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, entry) => sum + entry.value, 0);
  if (total === 0) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {payload
        .filter((entry) => entry.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {LABELS[entry.dataKey]}: {entry.value}
          </div>
        ))}
      <div className="mt-1 border-t pt-1 text-xs font-medium">Total: {total}</div>
    </div>
  );
}

export function AnalyticsChart({ data }: { data: DayBucket[] }) {
  const hasData = data.some((d) => d.answered + d.routed + d.welcomed + d.surfaced + d.flagged > 0);

  const days = data.length;
  const subtitle = days <= 1 ? 'Today' : `Last ${days} days`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Activity trend</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No activity recorded yet. The chart will populate as the bot handles messages.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                {Object.entries(COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {STACK_ORDER.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="actions"
                  stroke={COLORS[key]}
                  strokeWidth={1.5}
                  fill={`url(#grad-${key})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
