import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import {
    Home,
    FileText,
    User,
    Calendar,
    Clock,
    DollarSign,
    TrendingUp,
    Package,
    Shield,
    Settings,
    LogOut,
    HelpCircle
} from 'lucide-react';

const navigation = [
    {
        name: 'Dashboard',
        href: '/',
        icon: Home,
        current: false
    },
    {
        name: 'Profile Management',
        href: '/profile',
        icon: User,
        current: false
    },
    {
        name: 'Leave Management',
        href: '/leave',
        icon: Calendar,
        current: false
    },
    {
        name: 'Policy Management',
        href: '/policies',
        icon: Shield,
        current: false
    },
    {
        name: 'Performance Management',
        href: '/performance',
        icon: TrendingUp,
        current: false
    },
    {
        name: 'Payroll & Compensation',
        href: '/payroll',
        icon: DollarSign,
        current: false
    },
    {
        name: 'Performance Management',
        href: '/performance',
        icon: TrendingUp,
        current: false
    },
    {
        name: 'Asset Management',
        href: '/assets',
        icon: Package,
        current: false
    },
    {
        name: 'Policy Management',
        href: '/policies',
        icon: Shield,
        current: false
    }
];

export default function EmployeeSidebar() {
    const location = useLocation();

    // Preserve URL parameters (employee ID, company) when navigating
    const currentParams = location.search;

    // Debug: Log the current URL and parameters
    console.log('🔗 Sidebar - Current location:', location.pathname);
    console.log('🔗 Sidebar - URL parameters:', currentParams);
    console.log('🔗 Sidebar - Full location:', location);

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center px-6 border-b">
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Employee Portal</h1>
                        <p className="text-xs text-muted-foreground">HRIS System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href + currentParams}
                            className={cn(
                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'mr-3 h-5 w-5 flex-shrink-0',
                                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="border-t p-3 space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="mr-3 h-4 w-4" />
                    Help & Support
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                </Button>

                {/* HR Platform Link */}
                <Button
                    variant="outline"
                    className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    onClick={() => window.open('/hr-platform', '_blank')}
                >
                    <Shield className="mr-3 h-4 w-4" />
                    HR Platform
                </Button>

                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
