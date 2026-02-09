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

  // Auth
  signIn(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  sendMagicLink(email: string): Promise<{ success: boolean; error?: string }>;
  signOut(): void;
  refreshToken(): Promise<boolean>;
  onAuthUpdated(callback: () => void): () => void;

  // Capture
  sendCapture(title: string, notes?: string): Promise<{ success: boolean; error?: string; queued?: boolean }>;

  // Offline queue
  getQueue: () => Promise<QueueItem[]>;
  addToQueue: (item: QueueItem) => Promise<number>;
  clearQueue: () => Promise<boolean>;
  removeFromQueue: (index: number) => Promise<number>;

  // Draft
  getDraft(): Promise<string>;
  setDraft(text: string): Promise<boolean>;
}

interface AppSettings {
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;
  userId: string;
  userEmail: string;
  apiUrl: string;
  supabaseUrl: string;
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
