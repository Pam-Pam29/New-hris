import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Plane, User, Settings, Menu, LogOut } from 'lucide-react';
import React, { useState } from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showUserInfo?: boolean;
  actions?: React.ReactNode;
  callToAction?: React.ReactNode;
}

// Stub user for now
const user = { name: 'Jane Doe', email: 'jane.doe@example.com' };

export function Header({ title, subtitle, showUserInfo = true, actions, callToAction }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {title || 'Migrant Guide'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
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
            {showUserInfo && user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">{user.email}</p>
                </div>
                <Avatar />
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
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
          <div className="md:hidden bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 py-4 px-2 rounded-b-xl shadow-lg z-50">
            {actions && <div className="mb-4">{actions}</div>}
            {showUserInfo && user && (
              <div className="flex items-center space-x-3 mb-4">
                <Avatar />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">{user.email}</p>
                </div>
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mb-2">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}