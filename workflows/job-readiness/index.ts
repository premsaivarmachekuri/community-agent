import { anthropic } from "@ai-sdk/anthropic";
import { buildSystemPrompt } from "@/lib/agent";
import type { UserProfile, JobReadinessReport } from "@/lib/types";

export async function jobReadinessWorkflow(profile: UserProfile) {
  const systemPrompt = buildSystemPrompt();
  
  const userPrompt = `
Analyze this job seeker's profile and generate their complete job readiness plan:

Name: ${profile.name}
Tech Stack: ${profile.techStack.join(", ")}
Target Role: ${profile.targetRole}
Experience Level: ${profile.experienceLevel}
Projects: ${profile.projects.length > 0 ? profile.projects.map((p) => `${p.title} - ${p.description}`).join("; ") : "No projects listed"}
${profile.githubUrl ? `GitHub: ${profile.githubUrl}` : ""}
${profile.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : ""}

Return ONLY valid JSON, no markdown or extra text.`;

  try {
    const response = await anthropic("claude-opus-4-1", {
      system: systemPrompt,
    }).generateObject({
      prompt: userPrompt,
      schema: {
        type: "object" as const,
        properties: {
          gapAudit: {
            type: "object",
            properties: {
              projectQuality: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  feedback: { type: "string" },
                },
              },
              asyncCommunication: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  feedback: { type: "string" },
                },
              },
              toolingExpertise: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  feedback: { type: "string" },
                },
              },
              proofOfWork: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  feedback: { type: "string" },
                },
              },
              startupFit: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  feedback: { type: "string" },
                },
              },
              overallScore: { type: "number" },
              keyRecommendations: { type: "array", items: { type: "string" } },
            },
          },
          targetCompanies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                hiringSignals: { type: "array", items: { type: "string" } },
                relevance: { type: "string" },
                website: { type: "string" },
              },
            },
          },
          coldEmails: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
              },
            },
          },
          sprintPlan: {
            type: "object",
            properties: {
              days: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    title: { type: "string" },
                    actions: { type: "array", items: { type: "string" } },
                    targetOutcome: { type: "string" },
                  },
                },
              },
              successMetrics: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    });

    // Compile final report
    const report: JobReadinessReport = {
      profile,
      gapAudit: response.object.gapAudit,
      targetCompanies: response.object.targetCompanies,
      coldEmails: response.object.coldEmails,
      sprintPlan: response.object.sprintPlan,
      createdAt: new Date().toISOString(),
    };

    return report;
  } catch (error) {
    console.error("[v0] Workflow error:", error);
    throw error;
  }
}
