import React, { useState } from 'react';
import { Header } from './Header';
import { ComponentOption, ComponentCategory } from '../types/components';
import { PromptManagement } from './dashboard-components/PromptManagement/PromptManagement';
import { MetadataManagement } from './dashboard-components/MetadataManagement/MetadataManagement';
import APIStatus from './dashboard-components/APIStatus/APIStatus';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { GripVertical, X } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardProps {
  onLogout: () => void;
}

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

interface WidgetConfig {
  id: string;
  component: () => JSX.Element;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  title: string;
}

const componentMap: Record<string, WidgetConfig> = {
  promptManagement: {
    id: 'promptManagement',
    component: PromptManagement,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 8, h: 4 },
    title: 'Prompt Management'
  },
  metadataManagement: {
    id: 'metadataManagement',
    component: MetadataManagement,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 8, h: 4 },
    title: 'Metadata Generator'
  },
  apiStatus: {
    id: 'apiStatus',
    component: APIStatus,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 6, h: 4 },
    title: 'API Status'
  }
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeComponents, setActiveComponents] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboardComponents');
    return saved ? JSON.parse(saved) : [];
  });

  const availableComponents: ComponentCategory[] = [
    {
      name: 'Widgets',
      components: [
        {
          id: 'promptManagement',
          name: 'Prompt Management',
          type: 'promptManagement',
          category: 'Widgets',
          component: PromptManagement
        },
        {
          id: 'metadataManagement',
          name: 'Metadata Generator',
          type: 'metadataManagement',
          category: 'Widgets',
          component: MetadataManagement
        },
        {
          id: 'apiStatus',
          name: 'API Status',
          type: 'apiStatus',
          category: 'Widgets',
          component: APIStatus
        }
      ]
    }
  ];

  const handleComponentSelect = (component: ComponentOption) => {
    const widgetConfig = componentMap[component.type];
    if (!widgetConfig) return;

    const newId = `${component.type}-${Date.now()}`;
    const newLayoutItem: LayoutItem = {
      i: newId,
      x: 0,
      y: 0,
      w: widgetConfig.defaultSize.w,
      h: widgetConfig.defaultSize.h,
      minW: widgetConfig.minSize?.w,
      minH: widgetConfig.minSize?.h
    };

    setLayout([...layout, newLayoutItem]);
    setActiveComponents([...activeComponents, component.type]);
  };

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setLayout(newLayout);
  };

  const handleSave = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    localStorage.setItem('dashboardComponents', JSON.stringify(activeComponents));
    alert('Dashboard-Layout wurde gespeichert!');
  };

  const handleRemoveComponent = (itemId: string) => {
    const newLayout = layout.filter(item => item.i !== itemId);
    const componentType = itemId.split('-')[0];
    const newActiveComponents = activeComponents.filter(type => type !== componentType);

    setLayout(newLayout);
    setActiveComponents(newActiveComponents);

    // Optional: Automatisch speichern nach dem Entfernen
    localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
    localStorage.setItem('dashboardComponents', JSON.stringify(newActiveComponents));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        onLogout={onLogout}
        components={availableComponents}
        onComponentSelect={handleComponentSelect}
        onSave={handleSave}
      />

      <main className="p-4">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
          margin={[16, 16]}
          draggableHandle=".drag-handle"
          containerPadding={[0, 0]}
        >
          {layout.map((item) => {
            const componentType = item.i.split('-')[0];
            const widgetConfig = componentMap[componentType];
            const WidgetComponent = widgetConfig?.component;

            return WidgetComponent ? (
              <div key={item.i} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center gap-2 drag-handle cursor-move flex-1">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <h3 className="font-medium text-gray-700">{widgetConfig.title}</h3>
                  </div>
                  <button
                    onClick={() => handleRemoveComponent(item.i)}
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors ml-2"
                    title="Komponente entfernen"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  <WidgetComponent />
                </div>
              </div>
            ) : null;
          })}
        </ResponsiveGridLayout>
      </main>
    </div>
  );
}
