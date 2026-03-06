'use client';

import { useState } from 'react';
import { Slack } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function SignInButton() {
  const isDev = process.env.NODE_ENV !== 'production';
  const [loading, setLoading] = useState(false);

  async function handleDevSignIn() {
    setLoading(true);
    const email = 'dev@example.com';
    const password = 'dev-password';

    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      await authClient.signUp.email({ email, password, name: 'Dev User' });
      await authClient.signIn.email({ email, password });
    }
    window.location.href = '/';
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        onClick={() =>
          authClient.signIn.social({
            provider: 'slack',
            callbackURL: '/',
          })
        }
      >
        <Slack className="mr-2 h-4 w-4" />
        Sign in with Slack
      </Button>
      {isDev && (
        <Button variant="outline" className="w-full" onClick={handleDevSignIn} disabled={loading}>
          {loading ? 'Signing in...' : 'Dev Sign In (local only)'}
        </Button>
      )}
    </div>
  );
}
