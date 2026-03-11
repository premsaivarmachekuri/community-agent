import { ExternalLink } from "lucide-react";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { config } from "@/lib/config";
import { SignInButton } from "./sign-in-button";

const PROTOCOL_RE = /^https?:\/\//;

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>
            Sign in to the {config.communityName} admin panel
          </CardDescription>
          {config.slackWorkspaceUrl && (
            <a
              className="inline-flex items-center justify-center gap-1 text-muted-foreground text-sm hover:underline"
              href={config.slackWorkspaceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {config.slackWorkspaceUrl.replace(PROTOCOL_RE, "")}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardHeader>
        <CardContent>
          <Suspense>
            <SignInButton />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
