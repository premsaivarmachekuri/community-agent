// User Profile from Intake Form
export interface UserProfile {
  name: string;
  techStack: string[];
  projects: Project[];
  githubUrl?: string;
  linkedinUrl?: string;
  targetRole: string;
  experienceLevel: "first-job" | "career-pivot";
}

export interface Project {
  title: string;
  description: string;
}

// Gap Audit Results
export interface GapAudit {
  projectQuality: { score: number; feedback: string };
  asyncCommunication: { score: number; feedback: string };
  toolingExpertise: { score: number; feedback: string };
  proofOfWork: { score: number; feedback: string };
  startupFit: { score: number; feedback: string };
  overallScore: number;
  keyRecommendations: string[];
}

// Target Company for Cold Outreach
export interface TargetCompany {
  name: string;
  description: string;
  hiringSignals: string[];
  relevance: string;
  website: string;
}

// Cold Email Draft
export interface ColdEmailDraft {
  subject: string;
  body: string;
}

// 7-Day Sprint Plan
export interface SprintDay {
  day: number;
  title: string;
  actions: string[];
  targetOutcome: string;
}

export interface SprintPlan {
  days: SprintDay[];
  successMetrics: string[];
}

// Complete Workflow Output
export interface JobReadinessReport {
  profile: UserProfile;
  gapAudit: GapAudit;
  targetCompanies: TargetCompany[];
  coldEmails: Record<string, ColdEmailDraft>;
  sprintPlan: SprintPlan;
  createdAt: string;
}
