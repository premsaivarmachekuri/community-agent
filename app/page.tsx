'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sprint</h1>
          <p className="text-sm text-muted-foreground">Remote Job Readiness</p>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-5xl font-bold mb-4">
              Get job-ready in 7 days.
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Answer a few questions about yourself. Our AI analyzes your profile, 
              identifies gaps, finds target companies, and creates your personalized action plan.
            </p>
          </div>

          {!isFormOpen ? (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setIsFormOpen(true)}
                size="lg"
                className="px-8 py-6 text-lg"
              >
                Start Your Sprint
              </Button>
            </div>
          ) : (
            <Card className="p-8 mt-8 max-w-lg mx-auto w-full">
              <h3 className="text-2xl font-bold mb-6">Tell us about yourself</h3>
              <IntakeForm />
            </Card>
          )}

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-8">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">5 min</div>
              <p className="text-muted-foreground">Intake form</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">AI Analysis</div>
              <p className="text-muted-foreground">Gap audit & targets</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">7-Day Plan</div>
              <p className="text-muted-foreground">Actionable roadmap</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function IntakeForm() {
  const [formData, setFormData] = useState<{
    name: string;
    techStack: string;
    targetRole: string;
    experienceLevel: 'first-job' | 'career-pivot';
  }>({
    name: '',
    techStack: '',
    targetRole: '',
    experienceLevel: 'first-job',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          techStack: formData.techStack.split(',').map(s => s.trim()),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/processing?id=${data.workflowId}`;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Full Name *</label>
        <Input
          placeholder="John Doe"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tech Stack *</label>
        <Input
          placeholder="React, Node.js, TypeScript, etc."
          required
          value={formData.techStack}
          onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Target Role *</label>
        <Input
          placeholder="Full Stack Engineer, Frontend, etc."
          required
          value={formData.targetRole}
          onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Experience Level *</label>
        <select
          value={formData.experienceLevel}
          onChange={(e) => {
            const value = e.target.value as 'first-job' | 'career-pivot';
            setFormData({ 
              ...formData, 
              experienceLevel: value
            });
          }}
          className="w-full px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="first-job">First Job</option>
          <option value="career-pivot">Career Pivot</option>
        </select>
      </div>

      <Button type="submit" disabled={loading} className="w-full py-2 text-base">
        {loading ? 'Processing...' : 'Analyze My Profile'}
      </Button>
    </form>
  );
}
