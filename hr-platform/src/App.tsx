import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/organisms/Sidebar';
import { Header } from './components/organisms/Header';
import HrDashboard from './pages/Hr/Dashboard';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import HrEmployeeManagement from './components/HrEmployeeManagement';
import LeaveManagementSystem from './components/LeaveManagementSystem';
import PolicyManagementSystem from './components/PolicyManagementSystem';
import PerformanceManagementSystem from './components/PerformanceManagementSystem';
import RecruitmentPage from './pages/Hr/Hiring/Recruitment/index';
import CompanySetup from './pages/Hr/Settings/CompanySetup';
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
import CompanyOnboarding from './pages/Onboarding/CompanyOnboarding';
import DataCleanup from './pages/DataCleanup';
import { HrAuthGuard } from './components/HrAuthGuard';
import { HrSignUp } from './components/HrSignUp';

// Protected Route Component - Checks onboarding status
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { company, loading } = useCompany();

    // Show loading while company data is being fetched
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading company data...</p>
                </div>
            </div>
        );
    }

    // Check if onboarding is completed
    const onboardingCompleted = company?.settings?.onboardingCompleted;

    if (!onboardingCompleted) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

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
        <HrAuthGuard>
            <CompanyProvider>
                <Router>
                    <Routes>
                        {/* Onboarding Route - No Protection */}
                        <Route path="/onboarding" element={<CompanyOnboarding />} />

                        {/* Sign Up Route - After onboarding, before login */}
                        <Route path="/signup" element={<HrSignUp />} />

                        {/* Data Cleanup Route - No Protection (Standalone Tool) */}
                        <Route path="/data-cleanup" element={<DataCleanup />} />

                        {/* All other routes are protected - require onboarding completion */}
                        <Route path="/" element={
                            <ProtectedRoute>
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
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <HrDashboard />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Employee Management */}
                        <Route path="/hr/core-hr/employee-management" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <EmployeeManagement />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/hr/employee-management" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <EmployeeManagement />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/hr/employee/:employeeId" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <EmployeeProfileView />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Policy Management */}
                        <Route path="/hr/core-hr/policy-management" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <PolicyManagement />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Performance Management */}
                        <Route path="/hr/core-hr/performance-management" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <PerformanceManagement />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Leave Management */}
                        <Route path="/hr/core-hr/leave-management" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <LeaveManagement />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Recruitment */}
                        <Route path="/hr/hiring/recruitment" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <RecruitmentPage />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Job Board */}
                        <Route path="/hr/hiring/job-board" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <JobBoard />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Onboarding */}
                        <Route path="/hr/hiring/onboarding" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <Onboarding />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Payroll */}
                        <Route path="/hr/payroll" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <Payroll />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Asset Management */}
                        <Route path="/hr/core-hr/asset-management" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <AssetManagement />
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Time Management */}
                        <Route path="/hr/core-hr/time-management" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <TimeManagement />
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Help */}
                        <Route path="/help" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <div className="text-center py-12">
                                            <h1 className="text-3xl font-bold mb-4">Help Center</h1>
                                            <p className="text-muted-foreground mb-6">Help documentation coming soon...</p>
                                        </div>
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Support */}
                        <Route path="/support" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <div className="p-8">
                                        <div className="text-center py-12">
                                            <h1 className="text-3xl font-bold mb-4">Support</h1>
                                            <p className="text-muted-foreground mb-6">Support system coming soon...</p>
                                        </div>
                                    </div>
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Settings */}
                        <Route path="/settings" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <AvailabilitySettings />
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        {/* Availability Settings */}
                        <Route path="/hr/settings/availability" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <AvailabilitySettings />
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/hr/settings/company-setup" element={
                            <ProtectedRoute>
                                <HrLayout>
                                    <CompanySetup />
                                </HrLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={
                            <ProtectedRoute>
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
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Router>
            </CompanyProvider>
        </HrAuthGuard>
    );
}
