import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Hr/Dashboard';
import { Sidebar } from './components/organisms/Sidebar';
import React from 'react';
import EmployeeDirectory from './pages/Hr/CoreHr/EmployeeManagement/EmployeeDirectory';
import AssetManagement from './pages/Hr/CoreHr/AssetManagement';
import PolicyManagement from './pages/Hr/CoreHr/PolicyManagement';
// import OnboardingPage from './pages/Hr/Hiring/Onboarding';
import LeaveManagement from './pages/Hr/CoreHr/LeaveManagement';
import TimeManagement from './pages/Hr/CoreHr/TimeManagement';
import PerformanceManagement from './pages/Hr/CoreHr/PerformanceManagement';
import Recruitment from './pages/Hr/Hiring/Recruitment';
import JobBoard from './pages/Hr/Hiring/JobBoard';
import Payroll from './pages/Hr/Payroll/Payroll';

// Stubs for missing components
// const Payroll = () => <div>Payroll Page (Coming Soon)</div>;
// const Wallet = () => <div>Wallet Page (Coming Soon)</div>;
// const Benefit = () => <div>Benefit Page (Coming Soon)</div>;
// const Pension = () => <div>Pension Page (Coming Soon)</div>;
// const Tax = () => <div>Tax Page (Coming Soon)</div>;

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-h-screen bg-background text-foreground">
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

            {/* Legacy Routes (for backward compatibility) */}
            <Route path="/employee" element={<EmployeeDirectory />} />
            <Route path="/leavemanagement" element={<LeaveManagement />} />
            <Route path="/timetracking" element={<TimeManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
