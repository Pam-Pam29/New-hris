import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmployeeSidebar from './Sidebar';
import Dashboard from './Dashboard';
import ContractOnboarding from './ContractOnboarding';
import ProfileManagement from './ProfileManagement';
import LeaveManagement from './LeaveManagement';
import TimeManagement from './TimeManagement';
import PayrollCompensation from './PayrollCompensation';
import PerformanceManagement from './PerformanceManagement';
import AssetManagement from './AssetManagement';
import PolicyManagement from './PolicyManagement';

export default function EmployeeApp() {
    return (
        <div className="flex min-h-screen bg-background">
            <EmployeeSidebar />
            <main className="flex-1 min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <Routes>
                        {/* Employee Dashboard Routes */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Contract & Onboarding */}
                        <Route path="/contract-onboarding" element={<ContractOnboarding />} />

                        {/* Profile Management */}
                        <Route path="/profile" element={<ProfileManagement />} />

                        {/* Leave Management */}
                        <Route path="/leave" element={<LeaveManagement />} />

                        {/* Time Management */}
                        <Route path="/time" element={<TimeManagement />} />

                        {/* Payroll & Compensation */}
                        <Route path="/payroll" element={<PayrollCompensation />} />

                        {/* Performance Management */}
                        <Route path="/performance" element={<PerformanceManagement />} />

                        {/* Asset Management */}
                        <Route path="/assets" element={<AssetManagement />} />

                        {/* Policy Management */}
                        <Route path="/policies" element={<PolicyManagement />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
