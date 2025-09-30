import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/organisms/Sidebar';
import { Header } from './components/organisms/Header';
import Dashboard from './pages/Employee/Dashboard';
import Profile from './pages/Employee/Profile';
// Removed ProfileManagement import - keeping only Profile
import LeaveManagement from './pages/Employee/LeaveManagement';
import PolicyManagement from './pages/Employee/PolicyManagement';
import PerformanceManagement from './pages/Employee/PerformanceManagement';
import AssetManagement from './pages/Employee/MyAssets';
import TimeManagement from './pages/Employee/TimeManagement';
import PayrollCompensation from './pages/Employee/PayrollCompensation';
import OnboardingWizard from './pages/Employee/OnboardingWizard';
import SystemTraining from './pages/Employee/SystemTraining';
// Authentication components
import LoginPage from './pages/Employee/LoginPage';
import PasswordSetup from './pages/Employee/PasswordSetup';
// Testing components
import CreateTestProfile from './components/CreateTestProfile';
import FirebaseConnectionTest from './components/FirebaseConnectionTest';

// Employee Layout Component
const EmployeeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 min-h-screen bg-gradient-to-br from-green-50 via-background to-muted/20 text-foreground overflow-hidden">
            <div className="h-full overflow-y-auto">
                <Header
                    title="Employee Self-Service Portal"
                    subtitle="View profile, request leave, manage goals"
                />
                {children}
            </div>
        </main>
    </div>
);

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Authentication Routes - Outside of EmployeeLayout */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/setup" element={<PasswordSetup />} />
                <Route path="/employee/setup" element={<PasswordSetup />} />

                {/* Main Employee Portal - Default route shows login if not authenticated */}
                <Route path="/" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-green-900 mb-4">👤 EMPLOYEE SELF-SERVICE PORTAL</h1>
                                <p className="text-xl text-green-700">This is the Employee Platform</p>
                                <div className="mt-4 p-4 bg-green-100 rounded-lg">
                                    <p className="text-green-800 font-semibold">✅ Employee Platform Successfully Loaded!</p>
                                </div>
                            </div>
                            <Dashboard />
                        </div>
                    </EmployeeLayout>
                } />
                <Route path="/dashboard" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <Dashboard />
                        </div>
                    </EmployeeLayout>
                } />
                <Route path="/profile" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <Profile />
                        </div>
                    </EmployeeLayout>
                } />


                {/* Leave Management */}
                <Route path="/leave" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <LeaveManagement />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Performance Tracking */}
                <Route path="/performance" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <PerformanceManagement />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Policy Documents */}
                <Route path="/policies" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <PolicyManagement />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Asset Management */}
                <Route path="/assets" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <AssetManagement />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Time Tracking */}
                <Route path="/time" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <TimeManagement />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Payroll Information */}
                <Route path="/payroll" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <PayrollCompensation />
                        </div>
                    </EmployeeLayout>
                } />


                {/* Help */}
                <Route path="/help" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <div className="text-center py-12">
                                <h1 className="text-3xl font-bold mb-4">Help Center</h1>
                                <p className="text-muted-foreground mb-6">Help documentation coming soon...</p>
                            </div>
                        </div>
                    </EmployeeLayout>
                } />

                {/* Support */}
                <Route path="/support" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <div className="text-center py-12">
                                <h1 className="text-3xl font-bold mb-4">Support</h1>
                                <p className="text-muted-foreground mb-6">Support system coming soon...</p>
                            </div>
                        </div>
                    </EmployeeLayout>
                } />

                {/* Onboarding */}
                <Route path="/onboarding" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <OnboardingWizard employeeId="EMP123456ABC" />
                        </div>
                    </EmployeeLayout>
                } />
                <Route path="/employee/onboarding" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <OnboardingWizard employeeId="EMP123456ABC" />
                        </div>
                    </EmployeeLayout>
                } />

                {/* System Training */}
                <Route path="/training" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <SystemTraining />
                        </div>
                    </EmployeeLayout>
                } />

                <Route path="/test" element={
                    <EmployeeLayout>
                        <div className="p-8 space-y-6">
                            <CreateTestProfile />
                            <FirebaseConnectionTest />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Settings */}
                <Route path="/settings" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <div className="text-center py-12">
                                <h1 className="text-3xl font-bold mb-4">Settings</h1>
                                <p className="text-muted-foreground mb-6">Personal settings coming soon...</p>
                            </div>
                        </div>
                    </EmployeeLayout>
                } />

                <Route path="*" element={
                    <EmployeeLayout>
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                            <p className="text-muted-foreground mb-6">The employee page you're looking for doesn't exist.</p>
                            <a
                                href="/"
                                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Go to Employee Dashboard
                            </a>
                        </div>
                    </EmployeeLayout>
                } />
            </Routes>
        </Router>
    );
}
