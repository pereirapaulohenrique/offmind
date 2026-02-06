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
  const winHeight = 72;

  const win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: screenX + Math.round((screenW - winWidth) / 2),
    y: screenY + Math.round(screenH * 0.25),
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    hasShadow: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Load the renderer
  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'));
  }

  // Hide when losing focus
  win.on('blur', () => {
    hideCaptureWindow();
  });

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
  captureWindow.setPosition(
    screenX + Math.round((screenW - winWidth) / 2),
    screenY + Math.round(screenH * 0.25)
  );

  // Reset height to default (will expand when typing)
  captureWindow.setSize(winWidth, 72);

  captureWindow.show();
  captureWindow.focus();
  captureWindow.webContents.send('capture:focus');
}

function hideCaptureWindow(): void {
  if (captureWindow && !captureWindow.isDestroyed()) {
    captureWindow.hide();
    captureWindow.webContents.send('capture:reset');
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

  if (isDev) {
    settingsWindow.loadURL('http://localhost:5173/#/settings');
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
      captureWindow.setSize(width, Math.min(Math.max(height, 72), 220));
    }
  });

  // Settings
  ipcMain.handle('settings:get', () => {
    return {
      apiKey: store.get('apiKey', '') as string,
      apiUrl: store.get('apiUrl', 'https://offmind.ai') as string,
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
}

// App lifecycle
app.whenReady().then(() => {
  setupIPC();
  registerGlobalShortcut();
  createTray(toggleCaptureWindow, createSettingsWindow);
  captureWindow = createCaptureWindow();

  // Show settings on first launch if no API key
  const apiKey = store.get('apiKey', '') as string;
  if (!apiKey) {
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
