import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/organisms/Sidebar';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';

// Loading component
import { Loader } from './components/ui/loader';
import { OfflineIndicator } from './components/ui/offline-indicator';
import { SearchBar } from './components/ui/search-bar';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Hr/Dashboard'));
const EmployeeDirectory = lazy(() => import('./pages/Hr/CoreHr/EmployeeManagement/EmployeeDirectory'));
const AssetManagement = lazy(() => import('./pages/Hr/CoreHr/AssetManagement'));
const PolicyManagement = lazy(() => import('./pages/Hr/CoreHr/PolicyManagement'));
const LeaveManagement = lazy(() => import('./pages/Hr/CoreHr/LeaveManagement'));
const TimeManagement = lazy(() => import('./pages/Hr/CoreHr/TimeManagement'));
const PerformanceManagement = lazy(() => import('./pages/Hr/CoreHr/PerformanceManagement'));
const Recruitment = lazy(() => import('./pages/Hr/Hiring/Recruitment'));
const JobBoard = lazy(() => import('./pages/Hr/Hiring/JobBoard'));
const Payroll = lazy(() => import('./pages/Hr/Payroll/Payroll'));
const MFAPage = lazy(() => import('./pages/auth/MFAPage'));

// Stubs for missing components
// const Payroll = () => <div>Payroll Page (Coming Soon)</div>;
// const Wallet = () => <div>Wallet Page (Coming Soon)</div>;
// const Benefit = () => <div>Benefit Page (Coming Soon)</div>;
// const Pension = () => <div>Pension Page (Coming Soon)</div>;
// const Tax = () => <div>Tax Page (Coming Soon)</div>;

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen relative">
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background border-b shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-accent/50"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X size={20} className="text-foreground" />
            ) : (
              <Menu size={20} className="text-foreground" />
            )}
          </button>
          <h1 className="text-lg font-semibold">HRIS System</h1>
          <div className="w-10"></div> {/* Empty div for flex spacing */}
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar with responsive behavior */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          fixed md:relative z-40 transition-transform duration-300 ease-in-out
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Desktop header with search */}
        <div className="hidden md:flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10 shadow-sm w-full">
          <h1 className="text-xl font-semibold">HRIS System</h1>
          <SearchBar 
            placeholder="Search employees, documents, etc..."
            collection="employees"
            searchFields={['name', 'email', 'department', 'position']}
            className="w-1/3 max-w-md mx-4"
            onResultSelect={(result) => console.log('Selected:', result)}
          />
          <div className="w-10"></div> {/* Empty div for flex spacing */}
        </div>
        
        <main className="flex-1 w-full min-h-screen bg-background text-foreground md:ml-0 pt-16 md:pt-0 overflow-x-hidden">
          <OfflineIndicator className="mb-4" />
          <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader size="lg" /></div>}>
            <Routes>
              {/* Dashboard Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Core HR Routes */}
              <Route path="/Hr/CoreHr/EmployeeManagement" element={<EmployeeDirectory />} />
              <Route path="/Hr/CoreHr/PolicyManagement" element={<PolicyManagement />} />
              <Route path="/Hr/CoreHr/AssetManagement" element={<AssetManagement />} />
              <Route path="/Hr/CoreHr/PerformanceManagement" element={<PerformanceManagement />} />
              <Route path="/Hr/CoreHr/TimeManagement" element={<TimeManagement />} />
              <Route path="/Hr/CoreHr/LeaveManagement" element={<LeaveManagement />} />

              {/* Hiring & Onboarding Routes */}
              <Route path="/Hr/Hiring/Recruitment" element={<Recruitment />} />
              {/* <Route path="/Hr/Hiring/Onboarding" element={<OnboardingPage />} /> */}
              <Route path="/Hr/Hiring/JobBoard" element={<JobBoard />} />
              {/* <Route path="/onboarding/:employeeId" element={<OnboardingPage />} /> */}

              {/* Payroll Routes */}
              <Route path="/Hr/Payroll/Payroll" element={<Payroll />} />
              {/* <Route path="/Hr/Payroll/Wallet" element={<Wallet />} /> */}
              {/* <Route path="/Hr/Payroll/Salaries" element={<Salaries />} /> */}
              {/* <Route path="/Hr/Payroll/Benefit" element={<Benefit />} /> */}
              {/* <Route path="/Hr/Payroll/Pension" element={<Pension />} /> */}
              {/* <Route path="/Hr/Payroll/Tax" element={<Tax />} /> */}

              {/* Auth Routes */}
              <Route path="/auth/mfa" element={<MFAPage />} />
              
              {/* Legacy Routes (for backward compatibility) */}
              <Route path="/employee" element={<EmployeeDirectory />} />
              <Route path="/leavemanagement" element={<LeaveManagement />} />
              <Route path="/timetracking" element={<TimeManagement />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}
