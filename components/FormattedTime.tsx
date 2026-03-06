'use client';

type FormattedTimeProps = {
  timestamp: number;
};

export function FormattedTime({ timestamp }: FormattedTimeProps) {
  return (
    <time suppressHydrationWarning dateTime={new Date(timestamp).toISOString()}>
      {new Date(timestamp).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })}
    </time>
  );
}
