import { ExternalLink } from 'lucide-react';
import { AutoRefresh } from '@/components/AutoRefresh';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

type HeaderProps = {
  title: string;
  description?: string;
};

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <AutoRefresh />
        {config.slackWorkspaceUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={config.slackWorkspaceUrl} target="_blank" rel="noopener noreferrer">
              Open Slack <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
