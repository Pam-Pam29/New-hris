// Backup of original App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HrDashboard from './pages/Hr/Dashboard';
import EmployeeDashboard from './pages/Employee/Dashboard';
import EmployeeProfile from './pages/Employee/Profile';
import { Sidebar } from './components/organisms/Sidebar';
import React from 'react';
import FirebaseConnectionTest from './components/FirebaseConnectionTest';
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
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <Routes>
                            {/* HR Dashboard Routes */}
                            <Route path="/" element={<HrDashboard />} />
                            <Route path="/hr/dashboard" element={<HrDashboard />} />
                            <Route path="/dashboard" element={<HrDashboard />} />

                            {/* Employee Dashboard Routes */}
                            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                            <Route path="/employee/profile" element={<EmployeeProfile />} />
                            <Route path="/profile" element={<EmployeeProfile />} />

                            {/* Debug Route */}
                            <Route path="/test-profile" element={<div><h1>TEST ROUTE WORKS!</h1></div>} />

                            {/* Core HR Routes */}
                            <Route path="/hr/core-hr/employee-management" element={<EmployeeDirectory />} />
                            <Route path="/hr/core-hr/policy-management" element={<PolicyManagement />} />
                            <Route path="/hr/core-hr/asset-management" element={<AssetManagement />} />
                            <Route path="/hr/core-hr/performance-management" element={<PerformanceManagement />} />
                            <Route path="/hr/core-hr/time-management" element={<TimeManagement />} />
                            <Route path="/hr/core-hr/leave-management" element={<LeaveManagement />} />

                            {/* Legacy routes for backward compatibility */}
                            <Route path="/Hr/CoreHr/EmployeeManagement" element={<EmployeeDirectory />} />
                            <Route path="/Hr/CoreHr/PolicyManagement" element={<PolicyManagement />} />
                            <Route path="/Hr/CoreHr/AssetManagement" element={<AssetManagement />} />
                            <Route path="/Hr/CoreHr/PerformanceManagement" element={<PerformanceManagement />} />
                            <Route path="/Hr/CoreHr/TimeManagement" element={<TimeManagement />} />
                            <Route path="/Hr/CoreHr/LeaveManagement" element={<LeaveManagement />} />

                            {/* Hiring & Onboarding Routes */}
                            <Route path="/hr/hiring/recruitment" element={<Recruitment />} />
                            <Route path="/hr/hiring/job-board" element={<JobBoard />} />

                            {/* Legacy routes for backward compatibility */}
                            <Route path="/Hr/Hiring/Recruitment" element={<Recruitment />} />
                            <Route path="/Hr/Hiring/JobBoard" element={<JobBoard />} />
                            {/* <Route path="/Hr/Hiring/Onboarding" element={<OnboardingPage />} /> */}
                            {/* <Route path="/onboarding/:employeeId" element={<OnboardingPage />} /> */}

                            {/* Payroll Routes */}
                            <Route path="/hr/payroll" element={<Payroll />} />

                            {/* Legacy routes for backward compatibility */}
                            <Route path="/Hr/Payroll/Payroll" element={<Payroll />} />
                            {/* <Route path="/Hr/Payroll/Wallet" element={<Wallet />} /> */}
                            {/* <Route path="/Hr/Payroll/Salaries" element={<Salaries />} /> */}
                            {/* <Route path="/Hr/Payroll/Benefit" element={<Benefit />} /> */}
                            {/* <Route path="/Hr/Payroll/Pension" element={<Pension />} /> */}
                            {/* <Route path="/Hr/Payroll/Tax" element={<Tax />} /> */}

                            {/* Employee Dashboard Routes */}
                            <Route path="/employee/*" element={<EmployeeDashboard />} />

                            {/* Legacy Routes (for backward compatibility) */}
                            <Route path="/leavemanagement" element={<LeaveManagement />} />
                            <Route path="/timetracking" element={<TimeManagement />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}
