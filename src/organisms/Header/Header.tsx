import React from 'react';
import {LogOut, Server} from 'lucide-react';
import {Button} from '../../atoms/Button/Button';
import {useServerStatus} from '../../utils/hooks/useServerStatus';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({onLogout}: HeaderProps) {
  const {status, statusText} = useServerStatus();

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

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-50">
              <Server className={`w-4 h-4 ${getStatusColor()}`}/>
              <span className="text-sm text-gray-600">{statusText}</span>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={onLogout}
            icon={<LogOut className="w-5 h-5"/>}
          >
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  );
}