import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HrApp from './App-hr';
import EmployeeApp from './App-employee';

// Platform Selection Component
const PlatformSelector: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">HRIS System</h1>
          <p className="text-muted-foreground">Choose your platform</p>
        </div>

        <div className="space-y-4">
          <a
            href="/hr"
            className="w-full flex items-center justify-center px-6 py-4 border border-border rounded-lg hover:bg-accent transition-colors group"
          >
            <div className="text-center">
              <div className="text-lg font-semibold group-hover:text-accent-foreground">HR Platform</div>
              <div className="text-sm text-muted-foreground group-hover:text-accent-foreground/80">
                Manage employees, policies, and performance
              </div>
            </div>
          </a>

          <a
            href="/employee"
            className="w-full flex items-center justify-center px-6 py-4 border border-border rounded-lg hover:bg-accent transition-colors group"
          >
            <div className="text-center">
              <div className="text-lg font-semibold group-hover:text-accent-foreground">Employee Portal</div>
              <div className="text-sm text-muted-foreground group-hover:text-accent-foreground/80">
                View profile, request leave, manage goals
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  console.log('🔄 App: Component rendered');

  return (
    <Router>
      <Routes>
        {/* Platform Selection */}
        <Route path="/" element={<PlatformSelector />} />

        {/* HR Platform Routes */}
        <Route path="/hr/*" element={<HrApp />} />

        {/* Employee Platform Routes */}
        <Route path="/employee/*" element={<EmployeeApp />} />

        {/* Legacy Routes for Backward Compatibility */}
        <Route path="/profile" element={<EmployeeApp />} />
        <Route path="/dashboard" element={<EmployeeApp />} />

        {/* Fallback */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}