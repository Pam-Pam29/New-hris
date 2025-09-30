import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/organisms/Sidebar';
import { Header } from './components/organisms/Header';
import HrDashboard from './pages/Hr/Dashboard';
import HrEmployeeManagement from './components/HrEmployeeManagement';
import LeaveManagementSystem from './components/LeaveManagementSystem';
import PolicyManagementSystem from './components/PolicyManagementSystem';
import PerformanceManagementSystem from './components/PerformanceManagementSystem';
import RecruitmentPage from './pages/Hr/Hiring/Recruitment/index';
import JobBoard from './pages/Hr/Hiring/JobBoard/index';
import Payroll from './pages/Hr/Payroll/Payroll';
import AssetManagement from './pages/Hr/CoreHr/AssetManagement';
import EmployeeManagement from './pages/Hr/CoreHr/EmployeeManagement/EmployeeDirectory';
import EmployeeProfileView from './pages/Hr/CoreHr/EmployeeManagement/EmployeeProfileView';
import LeaveManagement from './pages/Hr/CoreHr/LeaveManagement';
import PerformanceManagement from './pages/Hr/CoreHr/PerformanceManagement';
import PolicyManagement from './pages/Hr/CoreHr/PolicyManagement';
import TimeManagement from './pages/Hr/CoreHr/TimeManagement';
import Onboarding from './pages/Hr/Hiring/Onboarding';
import AvailabilitySettings from './pages/Hr/CoreHr/Settings/AvailabilitySettings';

// HR Layout Component
const HrLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 via-background to-muted/20 text-foreground overflow-hidden">
            <div className="h-full overflow-y-auto">
                {children}
            </div>
        </main>
    </div>
);

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <HrLayout>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-blue-900 mb-4">🏢 HR MANAGEMENT PLATFORM</h1>
                                <p className="text-xl text-blue-700">This is the HR Platform</p>
                                <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                                    <p className="text-blue-800 font-semibold">✅ HR Platform Successfully Loaded!</p>
                                </div>
                            </div>
                            <HrDashboard />
                        </div>
                    </HrLayout>
                } />
                <Route path="/dashboard" element={
                    <HrLayout>
                        <div className="p-8">
                            <HrDashboard />
                        </div>
                    </HrLayout>
                } />

                {/* Employee Management */}
                <Route path="/hr/core-hr/employee-management" element={
                    <HrLayout>
                        <div className="p-8">
                            <EmployeeManagement />
                        </div>
                    </HrLayout>
                } />
                <Route path="/hr/employee-management" element={
                    <HrLayout>
                        <div className="p-8">
                            <EmployeeManagement />
                        </div>
                    </HrLayout>
                } />
                <Route path="/hr/employee/:employeeId" element={
                    <HrLayout>
                        <div className="p-8">
                            <EmployeeProfileView />
                        </div>
                    </HrLayout>
                } />

                {/* Policy Management */}
                <Route path="/hr/core-hr/policy-management" element={
                    <HrLayout>
                        <div className="p-8">
                            <PolicyManagement />
                        </div>
                    </HrLayout>
                } />

                {/* Performance Management */}
                <Route path="/hr/core-hr/performance-management" element={
                    <HrLayout>
                        <div className="p-8">
                            <PerformanceManagement />
                        </div>
                    </HrLayout>
                } />

                {/* Leave Management */}
                <Route path="/hr/core-hr/leave-management" element={
                    <HrLayout>
                        <div className="p-8">
                            <LeaveManagement />
                        </div>
                    </HrLayout>
                } />

                {/* Recruitment */}
                <Route path="/hr/hiring/recruitment" element={
                    <HrLayout>
                        <div className="p-8">
                            <RecruitmentPage />
                        </div>
                    </HrLayout>
                } />

                {/* Job Board */}
                <Route path="/hr/hiring/job-board" element={
                    <HrLayout>
                        <div className="p-8">
                            <JobBoard />
                        </div>
                    </HrLayout>
                } />

                {/* Onboarding */}
                <Route path="/hr/hiring/onboarding" element={
                    <HrLayout>
                        <div className="p-8">
                            <Onboarding />
                        </div>
                    </HrLayout>
                } />

                {/* Payroll */}
                <Route path="/hr/payroll" element={
                    <HrLayout>
                        <div className="p-8">
                            <Payroll />
                        </div>
                    </HrLayout>
                } />

                {/* Asset Management */}
                <Route path="/hr/core-hr/asset-management" element={
                    <HrLayout>
                        <AssetManagement />
                    </HrLayout>
                } />

                {/* Time Management */}
                <Route path="/hr/core-hr/time-management" element={
                    <HrLayout>
                        <div className="p-8">
                            <TimeManagement />
                        </div>
                    </HrLayout>
                } />

                {/* Help */}
                <Route path="/help" element={
                    <HrLayout>
                        <div className="p-8">
                            <div className="text-center py-12">
                                <h1 className="text-3xl font-bold mb-4">Help Center</h1>
                                <p className="text-muted-foreground mb-6">Help documentation coming soon...</p>
                            </div>
                        </div>
                    </HrLayout>
                } />

                {/* Support */}
                <Route path="/support" element={
                    <HrLayout>
                        <div className="p-8">
                            <div className="text-center py-12">
                                <h1 className="text-3xl font-bold mb-4">Support</h1>
                                <p className="text-muted-foreground mb-6">Support system coming soon...</p>
                            </div>
                        </div>
                    </HrLayout>
                } />

                {/* Settings */}
                <Route path="/settings" element={
                    <HrLayout>
                        <AvailabilitySettings />
                    </HrLayout>
                } />
                
                {/* Availability Settings */}
                <Route path="/hr/settings/availability" element={
                    <HrLayout>
                        <AvailabilitySettings />
                    </HrLayout>
                } />

                <Route path="*" element={
                    <HrLayout>
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                            <p className="text-muted-foreground mb-6">The HR page you're looking for doesn't exist.</p>
                            <a
                                href="/"
                                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Go to HR Dashboard
                            </a>
                        </div>
                    </HrLayout>
                } />
            </Routes>
        </Router>
    );
}
