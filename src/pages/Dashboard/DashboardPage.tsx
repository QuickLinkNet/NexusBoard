import React, {useState, useEffect} from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';
import {GripVertical, X} from 'lucide-react';
import {Card} from '../../molecules/Card/Card';
import {Button} from '../../atoms/Button/Button';
import {WidgetMenu} from './components/WidgetMenu';
import {ComponentOption} from '../../utils/types/components';
import APIStatus from './components/APIStatus';
import PendingPrompts from './components/PendingPrompts';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
  apiStatus: {
    id: 'apiStatus',
    component: APIStatus,
    defaultSize: {w: 6, h: 4},
    minSize: {w: 2, h: 2},
    title: 'API Status'
  },
  pendingPrompts: {
    id: 'pendingPrompts',
    component: PendingPrompts,
    defaultSize: {w: 6, h: 4},
    minSize: {w: 2, h: 2},
    title: 'Ausstehende Prompts'
  }
};

export function DashboardPage() {
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    return savedLayout ? JSON.parse(savedLayout) : [];
  });

  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    return savedWidgets ? JSON.parse(savedWidgets) : [];
  });

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setLayout(newLayout);
  };

  const handleSaveLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    localStorage.setItem('dashboardWidgets', JSON.stringify(activeWidgets));
  };

  const handleResetLayout = () => {
    localStorage.removeItem('dashboardLayout');
    localStorage.removeItem('dashboardWidgets');
    setLayout([]);
    setActiveWidgets([]);
  };

  const handleAddWidget = (component: ComponentOption) => {
    const widgetConfig = componentMap[component.type];
    if (!widgetConfig || activeWidgets.includes(component.type)) return;

    const newId = `${component.type}-${Date.now()}`;
    const newLayoutItem = {
      i: newId,
      x: 0,
      y: 0,
      w: widgetConfig.defaultSize.w,
      h: widgetConfig.defaultSize.h,
      minW: widgetConfig.minSize?.w,
      minH: widgetConfig.minSize?.h
    };

    setLayout([...layout, newLayoutItem]);
    setActiveWidgets([...activeWidgets, component.type]);
  };

  const handleRemoveWidget = (itemId: string) => {
    const newLayout = layout.filter(item => item.i !== itemId);
    const componentType = itemId.split('-')[0];
    const newActiveWidgets = activeWidgets.filter(type => type !== componentType);

    setLayout(newLayout);
    setActiveWidgets(newActiveWidgets);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <ResponsiveGridLayout
        className="layout"
        layouts={{lg: layout}}
        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
        cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        margin={[16, 16]}
        draggableHandle=".drag-handle"
        useCSSTransforms={true}
      >
        {layout.map((item) => {
          const componentType = item.i.split('-')[0];
          const widgetConfig = componentMap[componentType];
          const WidgetComponent = widgetConfig?.component;

          return WidgetComponent ? (
            <div key={item.i} className="h-full">
              <Card className="h-full flex flex-col">
                <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b">
                  <div className="flex items-center gap-2 drag-handle cursor-move">
                    <GripVertical className="w-4 h-4 text-gray-400"/>
                    <h3 className="font-medium text-gray-700">{widgetConfig.title}</h3>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveWidget(item.i)}
                    icon={<X className="w-4 h-4"/>}
                  />
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <WidgetComponent/>
                </div>
              </Card>
            </div>
          ) : null;
        })}
      </ResponsiveGridLayout>

      <WidgetMenu
        onAddWidget={handleAddWidget}
        availableWidgets={Object.entries(componentMap)
          .filter(([type]) => !activeWidgets.includes(type))
          .map(([type, config]) => ({
            id: type,
            name: config.title,
            type: type
          }))}
        onSaveLayout={handleSaveLayout}
        onResetLayout={handleResetLayout}
      />
    </div>
  );
}