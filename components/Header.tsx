import { ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { config } from '@/lib/config';

type HeaderProps = {
  title: string;
  description?: string;
};

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3 px-4 py-3">
      <SidebarTrigger />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold">{title}</h1>
        {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {config.slackWorkspaceUrl && (
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
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
