'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { JobReadinessReport } from '@/lib/types';

export default function ReportPage() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('id');
  const [report, setReport] = useState<JobReadinessReport | null>(null);
  const [activeTab, setActiveTab] = useState<'gaps' | 'companies' | 'sprint'>('gaps');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workflowId) {
      setError('Invalid workflow ID');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/report?id=${workflowId}`);
        if (!response.ok) throw new Error('Failed to fetch report');
        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load your report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [workflowId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading your report...</p>
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error || 'Report not found'}</p>
          <a href="/" className="text-primary hover:underline block">
            Start a new sprint
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Sprint Report</h1>
              <p className="text-muted-foreground mt-1">
                {report.profile.name}&apos;s 7-day job readiness plan
              </p>
            </div>
            <a href="/" className="text-primary text-sm hover:underline">
              New Sprint
            </a>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border px-4">
        <div className="max-w-4xl mx-auto flex gap-8">
          <button
            onClick={() => setActiveTab('gaps')}
            className={`py-4 font-medium border-b-2 ${
              activeTab === 'gaps'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Gap Audit
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`py-4 font-medium border-b-2 ${
              activeTab === 'companies'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Target Companies
          </button>
          <button
            onClick={() => setActiveTab('sprint')}
            className={`py-4 font-medium border-b-2 ${
              activeTab === 'sprint'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            7-Day Sprint
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'gaps' && <GapAuditTab report={report} />}
          {activeTab === 'companies' && <CompaniesTab report={report} />}
          {activeTab === 'sprint' && <SprintTab report={report} />}
        </div>
      </main>
    </div>
  );
}

function GapAuditTab({ report }: { report: JobReadinessReport }) {
  const { gapAudit } = report;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Gap Audit</h2>
        <p className="text-muted-foreground">
          Your overall score: <span className="text-2xl font-bold text-foreground">{gapAudit.overallScore}/100</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'projectQuality', label: 'Project Quality' },
          { key: 'asyncCommunication', label: 'Async Communication' },
          { key: 'toolingExpertise', label: 'Tooling Expertise' },
          { key: 'proofOfWork', label: 'Proof of Work' },
          { key: 'startupFit', label: 'Startup Fit' },
        ].map(({ key, label }) => {
          const score = gapAudit[key as keyof typeof gapAudit] as { score: number; feedback: string };
          return (
            <Card key={key} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{label}</h3>
                <span className="text-xl font-bold text-primary">{score.score}/10</span>
              </div>
              <p className="text-sm text-muted-foreground">{score.feedback}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-3">Key Recommendations</h3>
        <ul className="space-y-2">
          {gapAudit.keyRecommendations.map((rec, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span className="text-sm">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function CompaniesTab({ report }: { report: JobReadinessReport }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Target Companies</h2>
        <p className="text-muted-foreground">
          {report.targetCompanies.length} startup{report.targetCompanies.length !== 1 ? 's' : ''} matched to your profile
        </p>
      </div>

      {report.targetCompanies.map((company, idx) => (
        <Card key={idx} className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1">{company.name}</h3>
            <p className="text-sm text-muted-foreground">{company.description}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Why This Company:</p>
            <p className="text-sm">{company.relevance}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Hiring Signals:</p>
            <ul className="space-y-1">
              {company.hiringSignals.map((signal, sidx) => (
                <li key={sidx} className="text-sm flex gap-2">
                  <span>•</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          {report.coldEmails[company.name] && (
            <Card className="p-4 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Cold Email Draft</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Subject: {report.coldEmails[company.name].subject}
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {report.coldEmails[company.name].body}
                </p>
              </div>
              <Button size="sm" variant="outline" className="mt-3">
                Copy Email
              </Button>
            </Card>
          )}

          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline inline-block mt-4"
          >
            Visit Website →
          </a>
        </Card>
      ))}
    </div>
  );
}

function SprintTab({ report }: { report: JobReadinessReport }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">7-Day Sprint Plan</h2>
        <p className="text-muted-foreground">
          Your personalized action plan to get job-ready
        </p>
      </div>

      {report.sprintPlan.days.map((day) => (
        <Card key={day.day} className="p-6">
          <h3 className="text-lg font-bold mb-2">
            Day {day.day}: {day.title}
          </h3>

          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Actions:</p>
            <ul className="space-y-2">
              {day.actions.map((action, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    defaultChecked={false}
                  />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-1">Target Outcome:</p>
            <p className="text-sm">{day.targetOutcome}</p>
          </div>
        </Card>
      ))}

      <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <h3 className="font-semibold mb-3">Success Metrics</h3>
        <ul className="space-y-2">
          {report.sprintPlan.successMetrics.map((metric, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm">{metric}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
