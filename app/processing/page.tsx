'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function ProcessingPage() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('id');
  const [status, setStatus] = useState<string>('Initializing...');
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workflowId) {
      setError('Invalid workflow ID');
      return;
    }

    const connectSSE = () => {
      const eventSource = new EventSource(
        `/api/process-stream?workflowId=${workflowId}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'thinking') {
          setStatus(data.message);
          setMessages((prev) => [...prev, data.message]);
        } else if (data.type === 'complete') {
          eventSource.close();
          setTimeout(() => {
            window.location.href = `/report?id=${workflowId}`;
          }, 1000);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        eventSource.close();
        setError('Connection lost. Please refresh.');
      };

      return eventSource;
    };

    const eventSource = connectSSE();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [workflowId]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <a href="/" className="text-primary hover:underline">
            Start over
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Sprint</h1>
        </div>
      </header>

      {/* Processing Screen */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Analyzing your profile</h2>
            <p className="text-muted-foreground">
              This may take a few minutes. We&apos;re analyzing your gaps, researching
              companies, and creating your personalized action plan.
            </p>
          </div>

          {/* Current Status */}
          <Card className="p-6 bg-card border border-border">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              </div>
              <div>
                <p className="font-medium">{status}</p>
              </div>
            </div>
          </Card>

          {/* Thinking Steps */}
          {messages.length > 0 && (
            <Card className="p-6 bg-card border border-border">
              <h3 className="font-semibold mb-4">Progress</h3>
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <p className="text-sm text-muted-foreground">{msg}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
