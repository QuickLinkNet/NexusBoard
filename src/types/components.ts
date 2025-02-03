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