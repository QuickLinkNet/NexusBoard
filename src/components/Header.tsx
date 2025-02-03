import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, Plus, Save, Server } from 'lucide-react';
import { ComponentOption, ComponentCategory } from '../types/components';
import { apiService } from '../lib/apiService';

interface HeaderProps {
  onLogout: () => void;
  components: ComponentCategory[];
  onComponentSelect: (component: ComponentOption) => void;
  onSave: () => void;
}

export function Header({ onLogout, components, onComponentSelect, onSave }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentOption | null>(null);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      const isAvailable = await apiService.getServerStatus();
      setServerStatus(isAvailable ? 'online' : 'offline');
    } catch (err) {
      setServerStatus('offline');
    }
  };

  const handleAddComponent = () => {
    if (selectedComponent) {
      onComponentSelect(selectedComponent);
      setSelectedComponent(null);
      setIsOpen(false);
    }
  };

  const handleComponentSelect = (component: ComponentOption) => {
    setSelectedComponent(component);
    setIsOpen(false);
  };

  const getServerStatusColor = () => {
    switch (serverStatus) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'online':
        return 'Backend verbunden';
      case 'offline':
        return 'Offline Modus';
      default:
        return 'Prüfe Server...';
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Mein Dashboard</h1>
            <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-50">
              <Server className={`w-4 h-4 ${getServerStatusColor()}`} />
              <span className="text-sm text-gray-600">{getServerStatusText()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div ref={dropdownRef} className="relative flex items-center gap-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                <span>{selectedComponent ? selectedComponent.name : 'Komponente wählen'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <button
                onClick={handleAddComponent}
                disabled={!selectedComponent}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  selectedComponent
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Hinzufügen</span>
              </button>
              
              {isOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {components.map((category) => (
                      <div key={category.name}>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                          {category.name}
                        </div>
                        {category.components.map((component) => (
                          <button
                            key={component.id}
                            onClick={() => handleComponentSelect(component)}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              selectedComponent?.id === component.id
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {component.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onSave}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Speichern</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}