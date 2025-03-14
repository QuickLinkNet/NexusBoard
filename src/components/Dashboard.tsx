import React, {useState, useEffect} from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';
import {GripVertical, X} from 'lucide-react';
import {WidgetMenu} from './WidgetMenu';
import {ComponentOption, ComponentCategory} from '../types/components';
import APIStatus from './dashboard-components/APIStatus/APIStatus';

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
  }
};

export function Dashboard() {
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    return savedLayout ? JSON.parse(savedLayout) : [];
  });

  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    return savedWidgets ? JSON.parse(savedWidgets) : [];
  });

  const availableComponents: ComponentCategory[] = [
    {
      name: 'Verfügbare Widgets',
      components: Object.entries(componentMap)
        .filter(([type]) => !activeWidgets.includes(type))
        .map(([type, config]) => ({
          id: type,
          name: config.title,
          type: type,
          category: 'Widgets',
          component: config.component
        }))
    },
    {
      name: 'Aktive Widgets',
      components: Object.entries(componentMap)
        .filter(([type]) => activeWidgets.includes(type))
        .map(([type, config]) => ({
          id: type,
          name: config.title,
          type: type,
          category: 'Widgets',
          component: config.component
        }))
    }
  ];

  const handleComponentSelect = (component: ComponentOption) => {
    const widgetConfig = componentMap[component.type];
    if (!widgetConfig || activeWidgets.includes(component.type)) return;

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
    setActiveWidgets([...activeWidgets, component.type]);
  };

  const handleRemoveWidget = (itemId: string) => {
    const newLayout = layout.filter(item => item.i !== itemId);
    const componentType = itemId.split('-')[0];
    const newActiveWidgets = activeWidgets.filter(type => type !== componentType);

    setLayout(newLayout);
    setActiveWidgets(newActiveWidgets);
  };

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

  const getResponsiveLayout = (breakpoint: string, items: LayoutItem[]) => {
    return items.map(item => {
      const widgetConfig = componentMap[item.i.split('-')[0]];
      let minW = widgetConfig?.minSize?.w || 2;
      let w = item.w;

      switch (breakpoint) {
        case 'md':
          minW = Math.min(minW, 3);
          w = Math.min(w, 10);
          break;
        case 'sm':
          minW = Math.min(minW, 2);
          w = Math.min(w, 6);
          break;
        case 'xs':
          minW = Math.min(minW, 2);
          w = Math.min(w, 4);
          break;
        case 'xxs':
          minW = Math.min(minW, 1);
          w = Math.min(w, 2);
          break;
      }

      return {
        ...item,
        minW,
        w
      };
    });
  };

  const layouts = {
    lg: layout,
    md: getResponsiveLayout('md', layout),
    sm: getResponsiveLayout('sm', layout),
    xs: getResponsiveLayout('xs', layout),
    xxs: getResponsiveLayout('xxs', layout)
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
        cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        margin={[16, 16]}
        draggableHandle=".drag-handle"
        containerPadding={[0, 0]}
        compactType="vertical"
        preventCollision={false}
        resizeHandles={['se']}
      >
        {layout.map((item) => {
          const componentType = item.i.split('-')[0];
          const widgetConfig = componentMap[componentType];
          const WidgetComponent = widgetConfig?.component;

          return WidgetComponent ? (
            <div key={item.i} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
              <div
                className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2 drag-handle cursor-move flex-1">
                  <GripVertical className="w-4 h-4 text-gray-400"/>
                  <h3 className="font-medium text-gray-700">{widgetConfig.title}</h3>
                </div>
                <button
                  onClick={() => handleRemoveWidget(item.i)}
                  className="p-1 hover:bg-gray-200 rounded-md transition-colors ml-2"
                  title="Widget entfernen"
                >
                  <X className="w-4 h-4 text-gray-500"/>
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <WidgetComponent/>
              </div>
            </div>
          ) : null;
        })}
      </ResponsiveGridLayout>

      <WidgetMenu
        components={availableComponents}
        onComponentSelect={handleComponentSelect}
        onSaveLayout={handleSaveLayout}
        onResetLayout={handleResetLayout}
      />
    </div>
  );
}