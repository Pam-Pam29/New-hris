import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HrDashboard from './pages/Hr/Dashboard';
import HrEmployeeManagement from './components/HrEmployeeManagement';
import LeaveManagementSystem from './components/LeaveManagementSystem';
import PolicyManagementSystem from './components/PolicyManagementSystem';
import PerformanceManagementSystem from './components/PerformanceManagementSystem';

// HR Layout Component
const HrLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex min-h-screen bg-background">
        {/* HR Sidebar */}
        <div className="w-64 bg-blue-50 border-r border-blue-200">
            <div className="p-6">
                <h2 className="text-xl font-bold text-blue-900">🏢 HR Platform</h2>
            </div>
            <nav className="px-4 pb-4">
                <div className="space-y-2">
                    <a href="/" className="block px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent">
                        Dashboard
                    </a>
                    <a href="/employees" className="block px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent">
                        Employee Management
                    </a>
                    <a href="/leave" className="block px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent">
                        Leave Management
                    </a>
                    <a href="/policies" className="block px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent">
                        Policy Management
                    </a>
                    <a href="/performance" className="block px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent">
                        Performance Management
                    </a>
                </div>
            </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 via-background to-muted/20 text-foreground overflow-hidden">
            <div className="h-full overflow-y-auto">
                <div className="p-4 bg-blue-100 border-b border-blue-200">
                    <h1 className="text-2xl font-bold text-blue-900">🏢 HR Management Dashboard</h1>
                    <p className="text-blue-700">Manage employees, policies, and performance</p>
                </div>
                {children}
            </div>
        </main>
    </div>
);

// HR Platform App
export default function HrApp() {
    console.log('🏢 HR Platform App is loading!');
    return (
        <Router>
            <Routes>
                {/* HR Dashboard */}
                <Route path="/" element={
                    <HrLayout>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-blue-900 mb-4">🏢 HR MANAGEMENT PLATFORM</h1>
                                <p className="text-xl text-blue-700">This is the HR Platform - Port 5173</p>
                                <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                                    <p className="text-blue-800 font-semibold">✅ HR Platform Successfully Loaded!</p>
                                </div>
                            </div>
                            <HrDashboard />
                        </div>
                    </HrLayout>
                } />

                {/* Employee Management */}
                <Route path="/employees" element={
                    <HrLayout>
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold">Employee Management</h1>
                                <p className="text-muted-foreground">Manage employee profiles and track completion status</p>
                            </div>
                            <HrEmployeeManagement />
                        </div>
                    </HrLayout>
                } />

                {/* Leave Management */}
                <Route path="/leave" element={
                    <HrLayout>
                        <LeaveManagementSystem isHR={true} />
                    </HrLayout>
                } />

                {/* Policy Management */}
                <Route path="/policies" element={
                    <HrLayout>
                        <PolicyManagementSystem isHR={true} />
                    </HrLayout>
                } />

                {/* Performance Management */}
                <Route path="/performance" element={
                    <HrLayout>
                        <PerformanceManagementSystem isHR={true} />
                    </HrLayout>
                } />

                {/* Fallback - redirect to HR dashboard */}
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
