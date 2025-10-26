import React, { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "../ui/navigation-menu";
import { Separator } from "../ui/separator";
import { Avatar } from "../ui/avatar";
import { Sun, Moon } from 'lucide-react';
import { Users, Briefcase, FileText, BarChart2, Clock, Calendar, Wallet, DollarSign, Gift, Shield, Percent, UserPlus, ClipboardList, BookOpen, LayoutDashboard, Building2, LifeBuoy, HelpCircle, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { User } from 'lucide-react';
import { Button } from "../ui/button";
import { useTheme } from '../atoms/ThemeProvider';
import { TypographyH2, TypographySmall, TypographyMuted } from '../ui/typography';
import { useLocation } from 'react-router-dom';
import { useCompany } from '../../context/CompanyContext';

const navStructure = [
  {
    heading: 'Core HR',
    links: [
      { label: 'Employee Management', href: '/hr/core-hr/employee-management', icon: Users },
      { label: 'Policy Management', href: '/hr/core-hr/policy-management', icon: FileText },
      { label: 'Asset Management', href: '/hr/core-hr/asset-management', icon: Briefcase },
      { label: 'Performance Management', href: '/hr/core-hr/performance-management', icon: BarChart2 },
      { label: 'Time Management', href: '/hr/core-hr/time-management', icon: Clock },
      { label: 'Leave Management', href: '/hr/core-hr/leave-management', icon: Calendar },
    ],
  },
  {
    heading: 'Hiring & Onboarding',
    links: [
      { label: 'Recruitment', href: '/hr/hiring/recruitment', icon: UserPlus },
      // { label: 'Onboarding', href: '/hr/hiring/onboarding', icon: ClipboardList },
      { label: 'Job Board', href: '/hr/hiring/job-board', icon: BookOpen },
    ],
  },
  {
    heading: 'Payroll & Compensation',
    links: [
      { label: 'Payroll Management', href: '/hr/payroll', icon: DollarSign },
      // { label: 'Wallet', href: '/hr/payroll/wallet', icon: Wallet },
      // { label: 'Salaries', href: '/hr/payroll/salaries', icon: DollarSign },
      // { label: 'Benefit', href: '/hr/payroll/benefit', icon: Gift },
      // { label: 'Pension', href: '/hr/payroll/pension', icon: Shield },
      // { label: 'Tax', href: '/hr/payroll/tax', icon: Percent },
    ],
  },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { companyId, company, setCompany } = useCompany();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const [collapsed, setCollapsed] = useState(false);
  const dashboardLink = { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard };

  // Companies are now isolated per user account - no company switcher needed

  return (
    <aside className={`min-h-screen ${collapsed ? 'w-16' : 'w-72'} bg-card border-r border-border/50 flex flex-col text-foreground transition-all duration-300 shadow-soft animate-slide-in`}>
      {/* Company Display and Collapse Toggle */}
      <div className={`flex items-center gap-3 px-4 py-6 border-b border-border/50 mb-2 ${collapsed ? 'justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'p-2' : 'p-3'} bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl`}>
          <Building2 className="w-6 h-6 text-primary" />
          {!collapsed && (
            <div className="flex flex-col items-start">
              <span className="font-bold text-lg text-gradient">
                {company?.displayName || 'Loading...'}
              </span>
              <span className="text-xs text-muted-foreground">HRIS System</span>
            </div>
          )}
        </div>
        <button
          className="p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 group"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ?
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /> :
            <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          }
        </button>
      </div>
      <nav className={`flex-1 overflow-y-auto p-4 pt-0 ${collapsed ? 'px-2' : ''}`}>
        <div className={`flex flex-col ${collapsed ? 'gap-2' : 'gap-2'}`}>
          {/* Dashboard Link */}
          <ul className={`flex flex-col gap-1 mb-1 items-start`}>
            <SidebarNavLink link={dashboardLink} isActive={location.pathname === '/' || location.pathname.startsWith('/dashboard')} collapsed={collapsed} />
          </ul>
          {/* Sectioned Navigation */}
          {navStructure.map((section) => (
            <div key={section.heading} className="flex flex-col gap-1">
              {!collapsed && (
                <TypographyH2 className="text-xs font-semibold uppercase mb-1 tracking-wider border-none p-0 text-left text-muted-foreground">
                  {section.heading}
                </TypographyH2>
              )}
              <ul className="flex flex-col gap-1 items-start">
                {section.links.map((link) => {
                  const isActive = location.pathname.startsWith(link.href);
                  return (
                    <SidebarNavLink key={link.href} link={link} isActive={isActive} collapsed={collapsed} />
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Help, Support, Settings links */}
          <div className="flex flex-col gap-1 mt-4">
            <ul className={`flex flex-col gap-1 items-start`}>
              <SidebarNavLink link={{ label: 'Help', href: '/help', icon: HelpCircle }} isActive={location.pathname === '/help'} collapsed={collapsed} />
              <SidebarNavLink link={{ label: 'Support', href: '/support', icon: LifeBuoy }} isActive={location.pathname === '/support'} collapsed={collapsed} />
              <SidebarNavLink link={{ label: 'Settings', href: '/settings', icon: Settings }} isActive={location.pathname === '/settings'} collapsed={collapsed} />
              <SidebarNavLink link={{ label: 'HR Availability', href: '/hr/settings/availability', icon: Clock }} isActive={location.pathname === '/hr/settings/availability'} collapsed={collapsed} />
            </ul>
          </div>
        </div>
      </nav>
      {/* User info and dark mode toggle */}
      <div className={`p-4 flex flex-col gap-2 border-t border-border mt-auto ${collapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center gap-3 justify-between w-full ${collapsed ? 'flex-col gap-2' : ''}`}>
          <div className={`flex items-center gap-3 flex-1 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar className="border border-border dark:border-accent/30">
              <User className="w-6 h-6" />
            </Avatar>
            {!collapsed && (
              <div className="flex-1">
                <TypographySmall className="font-medium">HR Manager</TypographySmall>
                <TypographyMuted className="dark:text-muted-foreground">hr@acme.com</TypographyMuted>
              </div>
            )}
          </div>
          <div className={`flex gap-2 ${collapsed ? 'flex-col' : ''}`}>
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                className="bg-accent/50 dark:bg-accent/30 hover:bg-accent/80 dark:hover:bg-accent/50 border-border"
                aria-label="Toggle dark mode"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-destructive/10 dark:hover:bg-destructive/20 border-border"
              aria-label="Logout"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-destructive dark:text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// SidebarNavLink: helper for nav links with icon, active state, and collapsed mode
function SidebarNavLink({ link, isActive, collapsed }: { link: { label: string; href: string; icon: any }; isActive: boolean; collapsed?: boolean }) {
  return (
    <NavigationMenuItem className="w-full">
      <a
        href={link.href}
        className={
          `flex items-center gap-3 rounded-xl font-medium transition-all duration-200 group relative
          ${collapsed ? 'justify-center w-12 h-12 p-0' : 'px-4 py-3 text-sm w-full'}
          ${isActive
            ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-semibold shadow-soft'
            : 'hover:bg-accent/50 hover:shadow-soft text-foreground hover:text-primary'
          }
          `
        }
        title={collapsed ? link.label : undefined}
      >
        <link.icon className={`w-5 h-5 transition-all duration-200 ${isActive
          ? 'text-primary scale-110'
          : 'text-muted-foreground group-hover:text-primary group-hover:scale-105'
          }`} />
        {!collapsed && (
          <span className="transition-all duration-200 group-hover:translate-x-1">
            {link.label}
          </span>
        )}
        {isActive && !collapsed && (
          <div className="absolute right-3 w-2 h-2 bg-primary rounded-full animate-pulse" />
        )}
      </a>
    </NavigationMenuItem>
  );
}