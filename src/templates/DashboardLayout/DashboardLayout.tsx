import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {LayoutDashboard, LogOut, Settings, Wand2, Bell} from 'lucide-react';
import {cn} from '../../utils/helpers/cn';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export function DashboardLayout({children, onLogout}: DashboardLayoutProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({to, icon: Icon, children}: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
        isActive(to)
          ? "bg-blue-50 text-blue-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className={cn(
        "w-5 h-5",
        isActive(to) ? "text-blue-600" : "text-gray-400"
      )}/>
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-[2000px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-8">
              <Link to="/" className="font-semibold text-gray-900">
                NexusBoard
              </Link>

              <nav className="flex items-center gap-1">
                <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink to="/prompts" icon={Wand2}>Prompts</NavLink>
              </nav>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors relative"
                title="Benachrichtigungen"
              >
                <Bell className="w-5 h-5"/>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>
              </button>

              <button
                className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                title="Einstellungen"
              >
                <Settings className="w-5 h-5"/>
              </button>

              <div className="mx-2 h-6 w-px bg-gray-200"/>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                title="Abmelden"
              >
                <LogOut className="w-5 h-5"/>
                <span className="font-medium">Abmelden</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[2000px] mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}