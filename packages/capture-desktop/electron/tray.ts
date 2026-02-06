import { Tray, Menu, nativeImage, app } from 'electron';
import { join } from 'path';

let tray: Tray | null = null;

export function createTray(
  onCapture: () => void,
  onSettings: () => void
): void {
  // Create a 16x16 tray icon
  // In production, this would be a proper icon file
  // For now, create a simple template image
  const iconPath = join(__dirname, '../assets/tray-icon.png');
  let icon: Electron.NativeImage;

  try {
    icon = nativeImage.createFromPath(iconPath);
    icon = icon.resize({ width: 16, height: 16 });
  } catch {
    // Fallback: create a simple icon programmatically
    icon = nativeImage.createEmpty();
  }

  // On macOS, use template image for proper menu bar appearance
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  tray.setToolTip('OffMind Capture');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Capture',
      accelerator: 'CommandOrControl+Shift+Space',
      click: onCapture,
    },
    { type: 'separator' },
    {
      label: 'Settings...',
      click: onSettings,
    },
    { type: 'separator' },
    {
      label: 'Quit OffMind Capture',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Click tray icon to open capture (macOS)
  tray.on('click', onCapture);
}

export function updateTrayIcon(hasQueuedItems: boolean): void {
  // Could update the icon to show a dot when items are queued
  if (tray) {
    tray.setToolTip(
      hasQueuedItems
        ? 'OffMind Capture (items queued)'
        : 'OffMind Capture'
    );
  }
}
