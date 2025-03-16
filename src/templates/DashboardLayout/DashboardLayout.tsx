import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wand2,
  Settings,
  Bell,
  Search,
  LogOut,
  Share2,
  Calendar,
  FileText,
  Users,
  BarChart
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const SidebarItem = ({ to, icon: Icon, title }: { to: string; icon: React.ElementType; title: string }) => (
    <Link
      to={to}
      className={`sidebar-item group relative ${isActive(to) ? 'active' : ''}`}
      title={title}
    >
      <Icon className="w-6 h-6" />
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        {title}
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="py-4 flex flex-col items-center">
          <div className="mb-8">
            <Share2 className="w-8 h-8 text-white" />
          </div>

          <nav className="flex-1 w-full space-y-1">
            <SidebarItem to="/" icon={LayoutDashboard} title="Dashboard" />
            <SidebarItem to="/prompts" icon={Wand2} title="Prompts" />
            <SidebarItem to="/users" icon={Users} title="Benutzer" />
            <SidebarItem to="/calendar" icon={Calendar} title="Kalender" />
            <SidebarItem to="/documents" icon={FileText} title="Dokumente" />
            <SidebarItem to="/reports" icon={BarChart} title="Berichte" />
          </nav>

          <div className="mt-auto w-full">
            <button
              onClick={onLogout}
              className="sidebar-item w-full"
              title="Abmelden"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  className="search-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </button>

              <div className="h-8 w-px bg-gray-200"></div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Admin</span>
                <div className="avatar">
                  <span>A</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}