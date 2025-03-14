import React, {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {LogOut, Server, Wand2, Menu, X} from 'lucide-react';
import {useServerStatus} from '../hooks/useServerStatus';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export function Layout({children, onLogout}: LayoutProps) {
  const location = useLocation();
  const {status, statusText} = useServerStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavLinks = () => (
    <>
      <Link
        to="/prompts"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
          isActive('/prompts')
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Wand2 className="w-5 h-5"/>
        <span>Prompts</span>
      </Link>

      <button
        onClick={() => {
          setIsMobileMenuOpen(false);
          onLogout();
        }}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2"
      >
        <LogOut className="w-5 h-5"/>
        <span>Abmelden</span>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Dashboard
              </Link>

              <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-50">
                <Server className={`w-4 h-4 ${getStatusColor()}`}/>
                <span className="text-sm text-gray-600">{statusText}</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLinks/>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6"/>
              ) : (
                <Menu className="w-6 h-6"/>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-2 space-y-2">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-50 mb-4">
                <Server className={`w-4 h-4 ${getStatusColor()}`}/>
                <span className="text-sm text-gray-600">{statusText}</span>
              </div>
              <NavLinks/>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}