export interface ComponentOption {
  id: string;
  name: string;
  type: string;
  category: string;
  component: () => JSX.Element;
}

export interface ComponentCategory {
  name: string;
  components: ComponentOption[];
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}