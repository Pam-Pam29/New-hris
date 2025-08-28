import React, { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "../ui/navigation-menu";
import { Separator } from "../ui/separator";
import { Avatar } from "../ui/avatar";
import { Sun, Moon } from 'lucide-react';
import { Users, Briefcase, FileText, BarChart2, Clock, Calendar, Wallet, DollarSign, Gift, Shield, Percent, UserPlus, ClipboardList, BookOpen, LayoutDashboard, Building2, ChevronDown, LifeBuoy, HelpCircle, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from 'lucide-react';
import { Button } from "../ui/button";
import { useTheme } from '../atoms/ThemeProvider';
import { TypographyH2, TypographySmall, TypographyMuted } from '../ui/typography';
import { useLocation } from 'react-router-dom';
import { Popover } from '../ui/popover';

const navStructure = [
  {
    heading: 'Core HR',
    links: [
      { label: 'Employee Management', href: '/Hr/CoreHr/EmployeeManagement', icon: Users },
      { label: 'Policy Management', href: '/Hr/CoreHr/PolicyManagement', icon: FileText },
      { label: 'Asset Management', href: '/Hr/CoreHr/AssetManagement', icon: Briefcase },
      { label: 'Performance Management', href: '/Hr/CoreHr/PerformanceManagement', icon: BarChart2 },
      { label: 'Time Management', href: '/Hr/CoreHr/TimeManagement', icon: Clock },
      { label: 'Leave Management', href: '/Hr/CoreHr/LeaveManagement', icon: Calendar },
    ],
  },
  {
    heading: 'Hiring & Onboarding',
    links: [
      { label: 'Recruitment', href: '/Hr/Hiring/Recruitment', icon: UserPlus },
      // { label: 'Onboarding', href: '/Hr/Hiring/Onboarding', icon: ClipboardList },
      { label: 'Job Board', href: '/Hr/Hiring/JobBoard', icon: BookOpen },
    ],
  },
  {
    heading: 'Payroll',
    links: [
      { label: 'Payroll', href: '/Hr/Payroll/Payroll', icon: DollarSign },
      // { label: 'Wallet', href: '/Hr/Payroll/Wallet', icon: Wallet },
      // { label: 'Salaries', href: '/Hr/Payroll/Salaries', icon: DollarSign },
      // { label: 'Benefit', href: '/Hr/Payroll/Benefit', icon: Gift },
      // { label: 'Pension', href: '/Hr/Payroll/Pension', icon: Shield },
      // { label: 'Tax', href: '/Hr/Payroll/Tax', icon: Percent },
    ],
  },
];

const mockCompanies = [
  { name: 'Acme Corp', icon: Building2 },
  { name: 'Beta Inc', icon: Briefcase },
  { name: 'Gamma LLC', icon: Shield },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(mockCompanies[0]);
  const [companyPopoverOpen, setCompanyPopoverOpen] = useState(false);

  const dashboardLink = { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard };

  return (
    <aside className={`min-h-screen ${collapsed ? 'w-16' : 'w-64'} bg-background border-r flex flex-col text-foreground transition-all duration-200`}>
      {/* Company Switcher and Collapse Toggle */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-muted mb-2 ${collapsed ? 'justify-center' : ''}`}>
        <Popover open={companyPopoverOpen} onOpenChange={setCompanyPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              className={`flex items-center gap-2 focus:outline-none ${collapsed ? 'p-0' : 'p-2'} bg-muted rounded-lg`}
              aria-label="Switch company"
              onClick={() => setCompanyPopoverOpen((o) => !o)}
            >
              <selectedCompany.icon className="w-6 h-6 text-primary" />
              {!collapsed && <span className="font-semibold text-lg truncate">{selectedCompany.name}</span>}
              {!collapsed && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          </Popover.Trigger>
          <Popover.Content align="start" className="w-48 p-2">
            <ul className="flex flex-col gap-1">
              {mockCompanies.map((company) => (
                <li key={company.name}>
                  <button
                    className={`flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-muted transition-colors ${selectedCompany.name === company.name ? 'bg-muted font-semibold' : ''}`}
                    onClick={() => { setSelectedCompany(company); setCompanyPopoverOpen(false); }}
                  >
                    <company.icon className="w-5 h-5 text-primary" />
                    <span>{company.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Popover.Content>
        </Popover>
        <button
          className="p-1 rounded hover:bg-muted transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronLeft className="w-4 h-4 text-muted-foreground" />}
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
            </ul>
          </div>
        </div>
      </nav>
      {/* User info and dark mode toggle */}
      <div className={`p-4 flex flex-col gap-2 border-t mt-auto ${collapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center gap-3 justify-between w-full ${collapsed ? 'flex-col gap-2' : ''}`}>
          <div className={`flex items-center gap-3 flex-1 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar>
              <User className="w-6 h-6" />
            </Avatar>
            {!collapsed && (
              <div className="flex-1">
                <TypographySmall>Jane Doe</TypographySmall>
                <TypographyMuted>HR Manager</TypographyMuted>
              </div>
            )}
          </div>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

// SidebarNavLink: helper for nav links with icon, active state, and collapsed mode
function SidebarNavLink({ link, isActive, collapsed }: { link: { label: string; href: string; icon: any }; isActive: boolean; collapsed?: boolean }) {
  return (
    <NavigationMenuItem>
      <a
        href={link.href}
        className={
          `flex items-center gap-3 rounded-md font-medium transition-colors
          ${collapsed ? 'justify-center w-10 h-10 p-0' : 'px-3 py-2 text-sm w-full'}
          ${isActive ? 'bg-muted font-semibold' : 'hover:bg-muted'}
          ${isActive ? 'text-primary' : 'text-foreground'}
          `
        }
        title={collapsed ? link.label : undefined}
      >
        <link.icon className="w-5 h-5 text-muted-foreground" />
        {!collapsed && link.label}
      </a>
    </NavigationMenuItem>
  );
} 