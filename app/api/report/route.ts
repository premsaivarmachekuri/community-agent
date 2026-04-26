import { NextRequest, NextResponse } from 'next/server';
import { reportCache } from '../process/route';

export async function GET(request: NextRequest) {
  const workflowId = request.nextUrl.searchParams.get('id');

  if (!workflowId) {
    return NextResponse.json({ error: 'Missing workflow ID' }, { status: 400 });
  }

  // Try to get the report from cache
  const cachedReport = reportCache.get(workflowId);

  if (!cachedReport) {
    // If report not ready, return 202 Accepted to indicate processing
    return NextResponse.json(
      { error: 'Report still processing', workflowId },
      { status: 202 }
    );
  }

  return NextResponse.json(cachedReport);
}
