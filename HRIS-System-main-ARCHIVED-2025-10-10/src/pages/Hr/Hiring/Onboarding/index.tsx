import React from 'react';
import { useParams } from 'react-router-dom';
import { TypographyH2, TypographyP } from '@/components/ui/typography';

const OnboardingPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <header className="mb-8 text-center">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-foreground mb-6 text-white">Welcome to the HR Dashboard</h2>
        <TypographyP className="text-muted-foreground text-lg">
          We're thrilled to have you on board. This portal will guide you through your first few weeks.
        </TypographyP>
        <TypographyP className="text-sm text-muted-foreground mt-2">
          Onboarding for Employee ID: {employeeId}
        </TypographyP>
      </header>

      <div className="mt-10">
        <h3 className="text-2xl font-semibold border-b pb-2 mb-4">Your Onboarding Journey</h3>
        <p className="text-muted-foreground mb-6">Here is a brief overview of what you'll accomplish during your first four weeks.</p>
        {/* Placeholder for the 4-week plan will go here */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-muted-foreground">Onboarding steps and content will be displayed here soon.</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
