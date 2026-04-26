import { generateText } from "ai";
import { google } from "@ai-sdk/google";
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
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Compile final report
    const report: JobReadinessReport = {
      profile,
      gapAudit: parsedResponse.gapAudit,
      targetCompanies: parsedResponse.targetCompanies,
      coldEmails: parsedResponse.coldEmails,
      sprintPlan: parsedResponse.sprintPlan,
      createdAt: new Date().toISOString(),
    };

    return report;
  } catch (error) {
    console.error("[v0] Workflow error:", error);
    throw error;
  }
}
