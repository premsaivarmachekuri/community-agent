'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DayBucket = {
  date: string;
  answered: number;
  routed: number;
  welcomed: number;
  surfaced: number;
  flagged: number;
};

const COLORS: Record<string, string> = {
  answered: '#3b82f6',
  routed: '#f97316',
  welcomed: '#22c55e',
  surfaced: '#a855f7',
  flagged: '#ef4444',
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
    </div>
  );
}

export function AnalyticsChart({ data }: { data: DayBucket[] }) {
  const hasData = data.some(
    (d) => d.answered + d.routed + d.welcomed + d.surfaced + d.flagged > 0,
  );

  const days = data.length;
  const subtitle =
    days <= 1 ? 'Today' : `Last ${days} day${days === 1 ? '' : 's'}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Trend</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No activity recorded yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
              {Object.entries(COLORS).map(([key, color]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
