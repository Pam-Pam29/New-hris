import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Plane, Settings, Menu, LogOut, Sun, Moon } from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from '../atoms/ThemeProvider';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showUserInfo?: boolean;
  actions?: React.ReactNode;
  callToAction?: React.ReactNode;
}

export function Header({ title, subtitle, showUserInfo = true, actions, callToAction }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { currentEmployee } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-primary/80 to-primary p-2.5 rounded-xl">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {title || 'Migrant Guide'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {subtitle || 'Powered by Clan Finance'}
              </p>
            </div>
          </div>

          {/* Desktop User Info and Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {actions}
            {callToAction && (
              <div className="ml-4">
                {callToAction}
              </div>
            )}
            {showUserInfo && currentEmployee && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {currentEmployee.firstName && currentEmployee.lastName
                      ? `${currentEmployee.firstName} ${currentEmployee.lastName}`
                      : 'Employee'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentEmployee.email || 'employee@company.com'}
                  </p>
                </div>
                <Avatar />
                <Button variant="outline" size="sm" className="bg-accent/50 dark:bg-accent/30 hover:bg-accent/80 dark:hover:bg-accent/50 border-border" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-destructive/10 dark:hover:bg-destructive/20" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 text-destructive dark:text-destructive" />
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-accent/50 dark:hover:bg-accent/30">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            {callToAction && (
              <div className="mr-2">
                {callToAction}
              </div>
            )}
            <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border py-4 px-2 rounded-b-xl shadow-lg dark:shadow-accent/10 z-50">
            {actions && <div className="mb-4">{actions}</div>}
            {showUserInfo && currentEmployee && (
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="border border-border dark:border-accent/30" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {currentEmployee.firstName && currentEmployee.lastName
                      ? `${currentEmployee.firstName} ${currentEmployee.lastName}`
                      : 'Employee'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentEmployee.email || 'employee@company.com'}
                  </p>
                </div>
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mb-2 bg-accent/50 dark:bg-accent/30 hover:bg-accent/80 dark:hover:bg-accent/50" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-4 h-4 mr-2 text-amber-500" /> : <Moon className="w-4 h-4 mr-2 text-indigo-500" />} Toggle theme
            </Button>
            <Button variant="outline" size="sm" className="w-full mb-2 hover:bg-accent/50 dark:hover:bg-accent/30">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Button>
            <Button variant="outline" size="sm" className="w-full hover:bg-destructive/10 dark:hover:bg-destructive/20" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2 text-destructive dark:text-destructive" /> Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
