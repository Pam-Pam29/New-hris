import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Employee/Dashboard';
import Profile from './pages/Employee/Profile';
import LeaveManagementSystem from './components/LeaveManagementSystem';
import PolicyManagementSystem from './components/PolicyManagementSystem';
import PerformanceManagementSystem from './components/PerformanceManagementSystem';

// Employee Layout Component
const EmployeeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex min-h-screen bg-background">
        {/* Employee Sidebar */}
        <div className="w-64 bg-green-50 border-r border-green-200">
            <div className="p-6">
                <h2 className="text-xl font-bold text-green-900">👤 Employee Portal</h2>
            </div>
            <nav className="px-4 pb-4">
                <div className="space-y-2">
                    <a href="/" className="block px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent">
                        Dashboard
                    </a>
                    <a href="/profile" className="block px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent">
                        Profile Management
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
        <main className="flex-1 min-h-screen bg-gradient-to-br from-green-50 via-background to-muted/20 text-foreground overflow-hidden">
            <div className="h-full overflow-y-auto">
                <div className="p-4 bg-green-100 border-b border-green-200">
                    <h1 className="text-2xl font-bold text-green-900">👤 Employee Self-Service Portal</h1>
                    <p className="text-green-700">View profile, request leave, manage goals</p>
                </div>
                {children}
            </div>
        </main>
    </div>
);

// Employee Platform App
export default function EmployeeApp() {
    console.log('👤 Employee Platform App is loading!');
    return (
        <Router>
            <Routes>
                {/* Employee Dashboard */}
                <Route path="/" element={
                    <EmployeeLayout>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-green-900 mb-4">👤 EMPLOYEE SELF-SERVICE PORTAL</h1>
                                <p className="text-xl text-green-700">This is the Employee Platform - Port 5174</p>
                                <div className="mt-4 p-4 bg-green-100 rounded-lg">
                                    <p className="text-green-800 font-semibold">✅ Employee Platform Successfully Loaded!</p>
                                </div>
                            </div>
                            <Dashboard />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Employee Profile */}
                <Route path="/profile" element={
                    <EmployeeLayout>
                        <Profile />
                    </EmployeeLayout>
                } />

                {/* Employee Leave Management */}
                <Route path="/leave" element={
                    <EmployeeLayout>
                        <div className="p-6">
                            <LeaveManagementSystem isHR={false} employeeId="emp-001" />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Employee Policy Management */}
                <Route path="/policies" element={
                    <EmployeeLayout>
                        <div className="p-6">
                            <PolicyManagementSystem isHR={false} employeeId="emp-001" />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Employee Performance Management */}
                <Route path="/performance" element={
                    <EmployeeLayout>
                        <div className="p-6">
                            <PerformanceManagementSystem isHR={false} employeeId="emp-001" />
                        </div>
                    </EmployeeLayout>
                } />

                {/* Fallback - redirect to Employee dashboard */}
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
