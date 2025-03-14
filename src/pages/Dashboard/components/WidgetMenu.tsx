import React from 'react';
import {Plus, Save, RotateCcw} from 'lucide-react';
import {Button} from '../../../atoms/Button/Button';
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from '../../../atoms/Sheet/Sheet';

interface ComponentOption {
  id: string;
  name: string;
  type: string;
}

interface WidgetMenuProps {
  onAddWidget: (widget: ComponentOption) => void;
  availableWidgets: ComponentOption[];
  onSaveLayout: () => void;
  onResetLayout: () => void;
}

export function WidgetMenu({onAddWidget, availableWidgets, onSaveLayout, onResetLayout}: WidgetMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleResetLayout = () => {
    if (confirm('Möchten Sie wirklich das Layout zurücksetzen? Alle Widgets werden entfernt.')) {
      onResetLayout();
      setIsOpen(false);
    }
  };

  const handleSaveLayout = () => {
    onSaveLayout();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed right-6 bottom-6 flex flex-col gap-2">
        <Button
          variant="secondary"
          className="w-14 h-14 rounded-full shadow-lg bg-white hover:bg-gray-50"
          onClick={handleSaveLayout}
          title="Layout speichern"
        >
          <Save className="w-6 h-6 text-gray-700"/>
        </Button>

        <Button
          variant="secondary"
          className="w-14 h-14 rounded-full shadow-lg bg-white hover:bg-gray-50"
          onClick={handleResetLayout}
          title="Layout zurücksetzen"
        >
          <RotateCcw className="w-6 h-6 text-gray-700"/>
        </Button>

        <SheetTrigger asChild>
          <Button
            className="w-14 h-14 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700"
            title="Widget hinzufügen"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200"/>
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Widget hinzufügen</SheetTitle>
        </SheetHeader>

        <div className="mt-8">
          <div className="space-y-4">
            {availableWidgets.length > 0 ? (
              availableWidgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => {
                    onAddWidget(widget);
                    setIsOpen(false);
                  }}
                  className="w-full p-4 text-left bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{widget.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Klicken zum Hinzufügen
                      </p>
                    </div>
                    <Plus
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:rotate-90 transition-all"/>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Plus className="w-6 h-6 text-gray-400"/>
                </div>
                <p className="text-gray-500">
                  Keine weiteren Widgets verfügbar
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Alle Widgets wurden bereits hinzugefügt
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}