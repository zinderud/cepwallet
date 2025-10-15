/** UI state types */

export type UITheme = 'light' | 'dark' | 'auto';

export type UINotificationType = 'info' | 'success' | 'warning' | 'error';

export interface UINotification {
  id: string;
  type: UINotificationType;
  message: string;
  details?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type DialogType = 'alert' | 'confirm' | 'prompt';

export interface DialogOptions {
  title: string;
  message: string;
  type: DialogType;
  buttons?: string[];
  defaultValue?: string;
}

export interface UIState {
  theme: UITheme;
  notifications: UINotification[];
  dialog?: {
    open: boolean;
    options: DialogOptions;
  };
  loading: boolean;
  sidebarOpen: boolean;
}
