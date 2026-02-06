interface OffMindAPI {
  // Capture window
  hideCapture: () => void;
  resizeCapture: (height: number) => void;
  onCaptureFocus: (callback: () => void) => () => void;
  onCaptureReset: (callback: () => void) => () => void;

  // Settings
  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
  openSettings: () => void;
  closeSettings: () => void;

  // Offline queue
  getQueue: () => Promise<QueueItem[]>;
  addToQueue: (item: QueueItem) => Promise<number>;
  clearQueue: () => Promise<boolean>;
  removeFromQueue: (index: number) => Promise<number>;
}

interface AppSettings {
  apiKey: string;
  apiUrl: string;
  shortcut: string;
  launchAtLogin: boolean;
  theme: string;
}

interface QueueItem {
  title: string;
  notes?: string;
  timestamp: number;
}

declare global {
  interface Window {
    offmind: OffMindAPI;
  }
}

export {};
