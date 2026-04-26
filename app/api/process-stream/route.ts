import { NextRequest, NextResponse } from 'next/server';
import { reportCache, profileCache } from '../process/route';

export async function GET(request: NextRequest) {
  const workflowId = request.nextUrl.searchParams.get('workflowId');

  if (!workflowId) {
    return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });
  }

  // Verify workflow exists
  if (!profileCache.has(workflowId)) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Streaming thinking steps
        const thinkingSteps = [
          'Analyzing your profile for startup-fit signals...',
          'Identifying skill gaps across 5 dimensions...',
          'Researching target companies in your tech stack...',
          'Generating personalized cold email templates...',
          'Creating your 7-day action plan...',
        ];

        // Send thinking steps with status updates
        for (const step of thinkingSteps) {
          const data = JSON.stringify({ type: 'thinking', message: step });
          controller.enqueue(`data: ${data}\n\n`);
          console.log(`[v0] Stream ${workflowId}: ${step}`);

          // Wait while checking for report completion
          let elapsed = 0;
          const interval = setInterval(() => {
            if (reportCache.has(workflowId)) {
              clearInterval(interval);
              // Report is ready, move to next step faster
              elapsed = 10000;
            }
          }, 500);

          await new Promise((resolve) => setTimeout(resolve, 2000));
          clearInterval(interval);
        }

        // Check if report is ready, if not wait a bit more
        let attempts = 0;
        while (!reportCache.has(workflowId) && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }

        // Send completion message
        const completeData = JSON.stringify({ type: 'complete' });
        controller.enqueue(`data: ${completeData}\n\n`);
        console.log(`[v0] Stream ${workflowId}: complete`);

        controller.close();
      } catch (error) {
        console.error(`[v0] Stream error for ${workflowId}:`, error);
        controller.error(error);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
