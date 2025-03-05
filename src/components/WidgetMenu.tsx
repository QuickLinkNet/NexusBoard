import React, { useState } from 'react';
import { Plus, Save, RotateCcw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ComponentOption, ComponentCategory } from '../types/components';

interface WidgetMenuProps {
  components: ComponentCategory[];
  onComponentSelect: (component: ComponentOption) => void;
  onSaveLayout: () => void;
  onResetLayout: () => void;
}

export function WidgetMenu({ components, onComponentSelect, onSaveLayout, onResetLayout }: WidgetMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="fixed right-6 bottom-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center group">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
          <span className="sr-only">Menü öffnen</span>
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Dashboard Verwaltung</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Layout Verwaltung</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onSaveLayout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Save className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-blue-900">Layout speichern</div>
                  <div className="text-sm text-blue-700">Aktuelle Widget-Anordnung sichern</div>
                </div>
              </button>
              <button
                onClick={() => {
                  onResetLayout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Layout zurücksetzen</div>
                  <div className="text-sm text-gray-700">Alle Widgets entfernen</div>
                </div>
              </button>
            </div>
          </div>

          {components.map((category) => (
            <div key={category.name}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.components.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => {
                      onComponentSelect(component);
                      setIsOpen(false);
                    }}
                    disabled={category.name === 'Aktive Widgets'}
                    className={`w-full p-4 text-left rounded-lg transition-colors ${
                      category.name === 'Aktive Widgets'
                        ? 'bg-gray-100 cursor-not-allowed opacity-60'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {component.name}
                    </div>
                    {category.name === 'Aktive Widgets' && (
                      <div className="text-sm text-gray-500 mt-1">
                        Bereits auf dem Dashboard
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}