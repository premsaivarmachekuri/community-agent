import { NextRequest, NextResponse } from 'next/server';
import { jobReadinessWorkflow } from '@/workflows/job-readiness';
import type { UserProfile } from '@/lib/types';

// In-memory cache for profiles and reports (for development)
const profileCache = new Map<string, UserProfile>();
const reportCache = new Map<string, unknown>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.name || !body.techStack || !body.targetRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate workflow ID
    const workflowId = `sprint-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Create profile
    const profile: UserProfile = {
      name: body.name,
      techStack: Array.isArray(body.techStack) ? body.techStack : [body.techStack],
      projects: body.projects || [],
      targetRole: body.targetRole,
      experienceLevel: body.experienceLevel || 'first-job',
      githubUrl: body.githubUrl,
      linkedinUrl: body.linkedinUrl,
    };

    // Cache the profile
    profileCache.set(workflowId, profile);

    // Start the workflow asynchronously
    // In production, use Vercel Workflow SDK properly
    setImmediate(async () => {
      try {
        const report = await jobReadinessWorkflow(profile);
        reportCache.set(workflowId, report);
        console.log(`[v0] Workflow ${workflowId} completed`);
      } catch (error) {
        console.error(`[v0] Workflow ${workflowId} failed:`, error);
      }
    });

    return NextResponse.json({ workflowId });
  } catch (error) {
    console.error('Error in /api/process:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Export for external access (used by streaming and report endpoints)
export { profileCache, reportCache };
