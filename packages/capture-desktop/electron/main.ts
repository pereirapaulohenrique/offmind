import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import { join } from 'path';
import { createTray } from './tray';
import { createStore } from './store';

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let captureWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
const store = createStore();

// Determine if running in dev
const isDev = !app.isPackaged;

function createCaptureWindow(): BrowserWindow {
  // Get the display where the cursor currently is
  const cursorPoint = screen.getCursorScreenPoint();
  const activeDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { width: screenW, height: screenH, x: screenX, y: screenY } = activeDisplay.workArea;

  const winWidth = 620;
  const winHeight = 110;

  const win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: screenX + Math.round((screenW - winWidth) / 2),
    y: screenY + screenH - winHeight - 60,  // above taskbar
    frame: false,
    transparent: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    hasShadow: true,
    backgroundColor: '#1a1614',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Try Vite dev server first, fall back to built files
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'));
  }

  return win;
}

function showCaptureWindow(): void {
  if (!captureWindow || captureWindow.isDestroyed()) {
    captureWindow = createCaptureWindow();
  }

  // Reposition to active screen each time
  const cursorPoint = screen.getCursorScreenPoint();
  const activeDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { width: screenW, height: screenH, x: screenX, y: screenY } = activeDisplay.workArea;

  const winWidth = 620;
  const winHeight = 110;
  captureWindow.setPosition(
    screenX + Math.round((screenW - winWidth) / 2),
    screenY + screenH - winHeight - 60  // above taskbar
  );

  // Reset height to default (will expand when typing)
  captureWindow.setSize(winWidth, winHeight);

  captureWindow.show();
  captureWindow.focus();
  captureWindow.webContents.send('capture:reset');
  captureWindow.webContents.send('capture:focus');
}

function hideCaptureWindow(): void {
  if (captureWindow && !captureWindow.isDestroyed()) {
    captureWindow.hide();
  }
}

function toggleCaptureWindow(): void {
  if (captureWindow && captureWindow.isVisible()) {
    hideCaptureWindow();
  } else {
    showCaptureWindow();
  }
}

function createSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 440,
    height: 520,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Try Vite dev server first, fall back to built files
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/settings`);
  } else {
    settingsWindow.loadFile(join(__dirname, '../dist/index.html'), {
      hash: '/settings',
    });
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

async function signInWithCredentials(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = store.get('supabaseUrl', 'https://xxipgnrcxyagxsfnulwo.supabase.co') as string;
  const supabaseAnonKey = store.get('supabaseAnonKey', '') as string;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error_description || data.msg || 'Invalid credentials' };
    }

    const data = await response.json();

    store.set('accessToken', data.access_token);
    store.set('refreshToken', data.refresh_token);
    store.set('tokenExpiresAt', Math.floor(Date.now() / 1000) + (data.expires_in || 3600));
    store.set('userId', data.user?.id || '');
    store.set('userEmail', data.user?.email || email);

    // Notify settings window if open
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.webContents.send('auth:updated');
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Network error. Check your connection.' };
  }
}

async function signInWithMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = store.get('supabaseUrl', 'https://xxipgnrcxyagxsfnulwo.supabase.co') as string;
  const supabaseAnonKey = store.get('supabaseAnonKey', '') as string;
  const apiUrl = store.get('apiUrl', 'https://mindbase.vercel.app') as string;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        email,
        options: { emailRedirectTo: `${apiUrl}/callback` },
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error_description || data.msg || 'Failed to send magic link' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Network error. Check your connection.' };
  }
}

async function captureItem(title: string, notes?: string): Promise<{ success: boolean; error?: string; queued?: boolean }> {
  const accessToken = store.get('accessToken', '') as string;
  const userId = store.get('userId', '') as string;
  const supabaseUrl = store.get('supabaseUrl', 'https://xxipgnrcxyagxsfnulwo.supabase.co') as string;
  const supabaseAnonKey = store.get('supabaseAnonKey', '') as string;

  if (!accessToken || !userId) {
    return { success: false, error: 'Not signed in' };
  }

  // Check if token needs refresh
  const tokenExpiresAt = store.get('tokenExpiresAt', 0) as number;
  const now = Math.floor(Date.now() / 1000);
  let token = accessToken;

  if (tokenExpiresAt && now >= tokenExpiresAt - 60) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return { success: false, error: 'Session expired. Please sign in again.' };
    token = store.get('accessToken', '') as string;
  }

  try {
    // Insert directly into Supabase via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        title: title.trim(),
        notes: notes ? notes.trim() : null,
        layer: 'capture',
        source: 'desktop',
      }),
    });

    if (response.status === 401) {
      // Try refresh once
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = store.get('accessToken', '') as string;
        const retry = await fetch(`${supabaseUrl}/rest/v1/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${newToken}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            user_id: userId,
            title: title.trim(),
            notes: notes ? notes.trim() : null,
            layer: 'capture',
            source: 'desktop',
          }),
        });
        if (retry.ok || retry.status === 201) return { success: true };
      }
      return { success: false, error: 'Session expired. Please sign in again.' };
    }

    if (!response.ok && response.status !== 201) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.message || `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    // Network error — queue for later
    const queue = store.get('offlineQueue', []) as unknown[];
    queue.push({ title, notes, timestamp: Date.now() });
    store.set('offlineQueue', queue);
    return { success: true, queued: true };
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = store.get('refreshToken', '') as string;
  const supabaseUrl = store.get('supabaseUrl', 'https://xxipgnrcxyagxsfnulwo.supabase.co') as string;
  const supabaseAnonKey = store.get('supabaseAnonKey', '') as string;

  if (!refreshToken) return false;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    store.set('accessToken', data.access_token);
    store.set('refreshToken', data.refresh_token);
    store.set('tokenExpiresAt', Math.floor(Date.now() / 1000) + (data.expires_in || 3600));

    return true;
  } catch {
    return false;
  }
}

function registerGlobalShortcut(): void {
  const shortcut = store.get('shortcut', 'CommandOrControl+Shift+Space') as string;

  // Unregister all first
  globalShortcut.unregisterAll();

  const registered = globalShortcut.register(shortcut, toggleCaptureWindow);
  if (!registered) {
    console.error(`Failed to register global shortcut: ${shortcut}`);
  }
}

// IPC Handlers
function setupIPC(): void {
  // Capture window control
  ipcMain.on('capture:hide', () => hideCaptureWindow());

  ipcMain.on('capture:resize', (_event, height: number) => {
    if (captureWindow && !captureWindow.isDestroyed()) {
      const [width] = captureWindow.getSize();
      captureWindow.setSize(width, Math.min(Math.max(height, 110), 260));
    }
  });

  // Settings
  ipcMain.handle('settings:get', () => {
    return {
      accessToken: store.get('accessToken', '') as string,
      refreshToken: store.get('refreshToken', '') as string,
      tokenExpiresAt: store.get('tokenExpiresAt', 0) as number,
      userId: store.get('userId', '') as string,
      userEmail: store.get('userEmail', '') as string,
      apiUrl: store.get('apiUrl', 'https://offmind.ai') as string,
      supabaseUrl: store.get('supabaseUrl', '') as string,
      shortcut: store.get('shortcut', 'CommandOrControl+Shift+Space') as string,
      launchAtLogin: store.get('launchAtLogin', false) as boolean,
      theme: store.get('theme', 'dark') as string,
    };
  });

  ipcMain.handle('settings:set', (_event, settings: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(settings)) {
      store.set(key, value);
    }

    // Re-register shortcut if it changed
    if ('shortcut' in settings) {
      registerGlobalShortcut();
    }

    // Update launch-at-login
    if ('launchAtLogin' in settings) {
      app.setLoginItemSettings({
        openAtLogin: settings.launchAtLogin as boolean,
      });
    }

    return true;
  });

  // Open settings window
  ipcMain.on('settings:open', () => createSettingsWindow());

  // Close settings window
  ipcMain.on('settings:close', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
  });

  // Auth
  ipcMain.handle('auth:sign-in', async (_event, email: string, password: string) => {
    return signInWithCredentials(email, password);
  });

  ipcMain.handle('auth:magic-link', async (_event, email: string) => {
    return signInWithMagicLink(email);
  });

  ipcMain.on('auth:sign-out', () => {
    store.set('accessToken', '');
    store.set('refreshToken', '');
    store.set('tokenExpiresAt', 0);
    store.set('userId', '');
    store.set('userEmail', '');

    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.webContents.send('auth:updated');
    }
  });

  ipcMain.handle('auth:refresh', async () => {
    return refreshAccessToken();
  });

  // Offline queue
  ipcMain.handle('queue:get', () => {
    return store.get('offlineQueue', []) as unknown[];
  });

  ipcMain.handle('queue:add', (_event, item: unknown) => {
    const queue = store.get('offlineQueue', []) as unknown[];
    queue.push(item);
    store.set('offlineQueue', queue);
    return queue.length;
  });

  ipcMain.handle('queue:clear', () => {
    store.set('offlineQueue', []);
    return true;
  });

  ipcMain.handle('queue:remove', (_event, index: number) => {
    const queue = store.get('offlineQueue', []) as unknown[];
    queue.splice(index, 1);
    store.set('offlineQueue', queue);
    return queue.length;
  });

  // Capture (main process handles fetch to avoid CORS)
  ipcMain.handle('capture:send', async (_event, title: string, notes?: string) => {
    return captureItem(title, notes);
  });

  // Draft persistence
  ipcMain.handle('draft:get', () => {
    return store.get('draft', '') as string;
  });

  ipcMain.handle('draft:set', (_event, text: string) => {
    store.set('draft', text);
    return true;
  });
}

// App lifecycle
app.whenReady().then(() => {
  setupIPC();
  registerGlobalShortcut();
  createTray(toggleCaptureWindow, createSettingsWindow);
  captureWindow = createCaptureWindow();

  // Show settings on first launch if not authenticated
  const accessToken = store.get('accessToken', '') as string;
  if (!accessToken) {
    createSettingsWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// macOS: keep running when all windows closed
app.on('window-all-closed', (e: Event) => {
  e.preventDefault();
});

// Handle second instance
app.on('second-instance', () => {
  showCaptureWindow();
});
