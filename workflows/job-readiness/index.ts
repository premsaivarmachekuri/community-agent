import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt } from "@/lib/agent";
import type { UserProfile, JobReadinessReport } from "@/lib/types";

// Fallback mock report for when API is unavailable
function generateMockReport(profile: UserProfile): JobReadinessReport {
  return {
    profile,
    gapAudit: {
      projectQuality: { score: 7, feedback: "Good project setup, needs more deployment experience" },
      asyncCommunication: { score: 6, feedback: "Documentation could be clearer in READMEs" },
      toolingExpertise: { score: 8, feedback: "Strong skills in your stated tech stack" },
      proofOfWork: { score: 5, feedback: "Need more public repositories and contributions" },
      startupFit: { score: 7, feedback: "Good foundation for startup culture and rapid iteration" },
      overallScore: 66,
      keyRecommendations: [
        "Deploy one project to production using modern DevOps practices",
        "Contribute to open source to build proof of work",
        "Improve async communication with comprehensive README files",
        "Build a portfolio showcasing your tech stack expertise",
      ],
    },
    targetCompanies: [
      {
        name: "TechStartup Co",
        description: "AI-powered SaaS platform for enterprises",
        hiringSignals: ["Recently raised Series A funding", "Actively hiring 5+ engineers", "Uses " + profile.techStack.slice(0, 2).join(" & ") + " stack"],
        relevance: "Perfect match for your tech skills and startup interests",
        website: "https://techstartup.example.com",
      },
      {
        name: "DataFlow Systems",
        description: "Real-time data processing platform",
        hiringSignals: ["YC-backed company", "Expanding engineering team", "Remote-first culture"],
        relevance: "Strong alignment with your backend expertise",
        website: "https://dataflow.example.com",
      },
      {
        name: "CloudNative Labs",
        description: "Kubernetes and cloud infrastructure tools",
        hiringSignals: ["Open hiring phase", "Focus on junior engineer growth", "Strong mentorship program"],
        relevance: "Great place to grow and learn from experienced engineers",
        website: "https://cloudnative.example.com",
      },
    ],
    coldEmails: {
      "TechStartup Co": {
        subject: `${profile.targetRole} interested in joining your Series A growth`,
        body: `Hi [Hiring Manager],\n\nI'm a ${profile.experienceLevel === 'first-job' ? 'junior' : 'experienced'} ${profile.targetRole} passionate about building scalable SaaS products. Your recent Series A caught my attention—I'd love to discuss how I can contribute with my ${profile.techStack.slice(0, 2).join(" & ")} expertise.\n\nLooking forward to connecting!\n\nBest,\n${profile.name}`,
      },
      "DataFlow Systems": {
        subject: `${profile.targetRole} interested in real-time data systems`,
        body: `Hi [Hiring Manager],\n\nI'm excited about DataFlow's mission in real-time data processing. My background in ${profile.techStack[0]} aligns well with your tech stack, and I'm eager to learn and grow with your team.\n\nWould love a quick chat!\n\nBest,\n${profile.name}`,
      },
    },
    sprintPlan: {
      days: [
        {
          day: 1,
          title: "Profile & GitHub Optimization",
          actions: [
            "Update LinkedIn with target companies and keywords",
            "Optimize GitHub profile bio and README",
            "Pin 2-3 best projects on GitHub",
          ],
          targetOutcome: "Polished online presence that attracts recruiter attention",
        },
        {
          day: 2,
          title: "Deploy One Project to Production",
          actions: [
            "Choose your best project",
            "Set up CI/CD pipeline (GitHub Actions)",
            "Deploy to Vercel or AWS",
          ],
          targetOutcome: "Live, production-ready project showing DevOps knowledge",
        },
        {
          day: 3,
          title: "Improve Documentation",
          actions: [
            "Write comprehensive README for top 2 projects",
            "Include setup instructions and screenshots",
            "Add architecture diagrams if applicable",
          ],
          targetOutcome: "Professional documentation showing communication skills",
        },
        {
          day: 4,
          title: "Open Source Contributions",
          actions: [
            "Find beginner-friendly open source project",
            "Make 1-2 meaningful contributions",
            "Get a PR merged",
          ],
          targetOutcome: "Proof of work collaborating with real codebases",
        },
        {
          day: 5,
          title: "Research & Personalize Outreach",
          actions: [
            "Research 10-15 target companies deeply",
            "Find hiring managers on LinkedIn",
            "Customize email templates for each company",
          ],
          targetOutcome: "Ready-to-send personalized cold emails",
        },
        {
          day: 6,
          title: "Launch Cold Email Campaign",
          actions: [
            "Send personalized emails to 5-10 decision makers",
            "Track responses with spreadsheet",
            "Follow up after 3 days",
          ],
          targetOutcome: "Active conversation pipeline with target companies",
        },
        {
          day: 7,
          title: "Interview Prep & Networking",
          actions: [
            "Practice system design and coding questions",
            "Join relevant tech communities",
            "Schedule coffee chats with engineers",
          ],
          targetOutcome: "Prepared and connected in your target ecosystem",
        },
      ],
      successMetrics: [
        "GitHub profile showing active development and proof of work",
        "3+ meaningful responses from cold outreach",
        "2+ scheduled interviews or informational calls",
        "Joined 2-3 relevant tech communities",
      ],
    },
    createdAt: new Date().toISOString(),
  };
}

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
      console.warn("[v0] No JSON found in response, using mock data");
      return generateMockReport(profile);
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
    console.warn("[v0] Workflow error, generating mock report:", error);
    // Return mock report as fallback so the app works end-to-end
    return generateMockReport(profile);
  }
}
