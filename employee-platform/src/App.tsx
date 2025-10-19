import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import BookMeeting from './pages/Employee/BookMeeting';
// Authentication components
import LoginPage from './pages/Employee/LoginPage';
import PasswordSetup from './pages/Employee/PasswordSetup';
import EmployeeSetup from './pages/Employee/EmployeeSetup';
// Testing components
import CreateTestProfile from './components/CreateTestProfile';
import FirebaseConnectionTest from './components/FirebaseConnectionTest';
// Context providers for multi-tenancy and authentication
import { CompanyProvider } from './context/CompanyContext';
import { AuthProvider, useAuth } from './context/AuthContext';

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

// Protected Route - Requires authentication
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('🔒 [Auth] Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Protected Route - Requires authentication AND onboarding completion
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, currentEmployee, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('🔒 [ProtectedRoute] Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // Check if onboarding completed - TEMPORARILY BYPASSED FOR TESTING
    // if (currentEmployee?.onboardingStatus !== 'completed') {
    //     console.log('📋 [ProtectedRoute] Onboarding not complete, redirecting to onboarding');
    //     return <Navigate to="/onboarding" replace />;
    // }
    console.log('🚀 [ProtectedRoute] Onboarding bypassed for testing - going to dashboard');

    return <>{children}</>;
};

export default function App() {
    return (
        <AuthProvider>
            <CompanyProvider>
                <Router>
                    <Routes>
                        {/* Public Routes - No authentication required */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/setup" element={<EmployeeSetup />} />
                        <Route path="/employee/setup" element={<EmployeeSetup />} />
                        <Route path="/password-setup" element={<PasswordSetup />} />

                        {/* Onboarding Route - Requires authentication but NOT completion */}
                        <Route path="/onboarding" element={
                            <RequireAuth>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <OnboardingWizard />
                                    </div>
                                </EmployeeLayout>
                            </RequireAuth>
                        } />

                        {/* Protected Routes - Require authentication AND onboarding completion */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <Dashboard />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <Dashboard />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <Profile />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />


                        {/* Leave Management */}
                        <Route path="/leave" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <LeaveManagement />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />

                        {/* Performance Tracking */}
                        <Route path="/performance" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <PerformanceManagement />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />

                        {/* Book Meeting */}
                        <Route path="/book-meeting" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <BookMeeting />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />

                        {/* Policy Documents */}
                        <Route path="/policies" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <PolicyManagement />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />

                        {/* Asset Management */}
                        <Route path="/assets" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <AssetManagement />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />

                        {/* Time Tracking */}
                        <Route path="/time" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <TimeManagement />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />

                        {/* Payroll Information */}
                        <Route path="/payroll" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <PayrollCompensation />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />


                        {/* Help */}
                        <Route path="/help" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <div className="text-center py-12">
                                            <h1 className="text-3xl font-bold mb-4">Help Center</h1>
                                            <p className="text-muted-foreground mb-6">Help documentation coming soon...</p>
                                        </div>
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />

                        {/* Support */}
                        <Route path="/support" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <div className="text-center py-12">
                                            <h1 className="text-3xl font-bold mb-4">Support</h1>
                                            <p className="text-muted-foreground mb-6">Support system coming soon...</p>
                                        </div>
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />

                        {/* System Training */}
                        <Route path="/training" element={
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <SystemTraining />
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
                        } />

                        {/* Testing Route - Keep unprotected for development */}
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
                            <ProtectedRoute>
                                <EmployeeLayout>
                                    <div className="p-8">
                                        <div className="text-center py-12">
                                            <h1 className="text-3xl font-bold mb-4">Settings</h1>
                                            <p className="text-muted-foreground mb-6">Personal settings coming soon...</p>
                                        </div>
                                    </div>
                                </EmployeeLayout>
                            </ProtectedRoute>
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
            </CompanyProvider>
        </AuthProvider>
    );
}
