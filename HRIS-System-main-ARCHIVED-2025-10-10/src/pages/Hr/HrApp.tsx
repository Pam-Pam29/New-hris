import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HrDashboard from './Dashboard';
import HrEmployeeManagement from '../../components/HrEmployeeManagement';
import LeaveManagementSystem from '../../components/LeaveManagementSystem';
import PolicyManagementSystem from '../../components/PolicyManagementSystem';
import PerformanceManagementSystem from '../../components/PerformanceManagementSystem';

// HR Layout Component
const HrLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-background">
            {/* HR Sidebar */}
            <div className="w-64 bg-card border-r border-border">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-foreground">HR Platform</h2>
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
            <main className="flex-1 min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground overflow-hidden">
                <div className="h-full overflow-y-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

// HR Platform Routes
export default function HrApp() {
    return (
        <Router>
            <Routes>
                {/* HR Dashboard */}
                <Route path="/" element={
                    <HrLayout>
                        <HrDashboard />
                    </HrLayout>
                } />
                <Route path="/hr" element={
                    <HrLayout>
                        <HrDashboard />
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
                            <h1 className="text-2xl font-bold mb-4">HR Platform</h1>
                            <p className="text-muted-foreground mb-6">Welcome to the HR Management System</p>
                            <a
                                href="/hr"
                                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Go to Dashboard
                            </a>
                        </div>
                    </HrLayout>
                } />
            </Routes>
        </Router>
    );
}
