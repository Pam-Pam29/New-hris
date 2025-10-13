import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeSidebar from './Sidebar';
import Dashboard from './Dashboard';
import Profile from './Profile';
import LeaveManagementSystem from '../../components/LeaveManagementSystem';
import PolicyManagementSystem from '../../components/PolicyManagementSystem';
import PerformanceManagementSystem from '../../components/PerformanceManagementSystem';

// Employee Layout Component
const EmployeeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-background">
            <EmployeeSidebar />
            <main className="flex-1 min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground overflow-hidden">
                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

// Employee Platform Routes
export default function EmployeeApp() {
    return (
        <Router>
            <Routes>
                {/* Employee Dashboard */}
                <Route path="/" element={
                    <EmployeeLayout>
                        <Dashboard />
                    </EmployeeLayout>
                } />
                <Route path="/employee" element={
                    <EmployeeLayout>
                        <Dashboard />
                    </EmployeeLayout>
                } />

                {/* Employee Profile */}
                <Route path="/employee/profile" element={
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

                {/* Legacy routes for compatibility */}
                <Route path="/profile" element={
                    <EmployeeLayout>
                        <Profile />
                    </EmployeeLayout>
                } />

                <Route path="/dashboard" element={
                    <EmployeeLayout>
                        <Dashboard />
                    </EmployeeLayout>
                } />

                {/* Fallback - redirect to employee dashboard */}
                <Route path="*" element={
                    <EmployeeLayout>
                        <div className="p-6 text-center">
                            <div className="py-12">
                                <h1 className="text-2xl font-bold mb-4">Employee Portal</h1>
                                <p className="text-muted-foreground mb-6">Welcome to your employee dashboard</p>
                                <a
                                    href="/employee"
                                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                >
                                    Go to Dashboard
                                </a>
                            </div>
                        </div>
                    </EmployeeLayout>
                } />
            </Routes>
        </Router>
    );
}