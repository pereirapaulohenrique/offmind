import { Tray, Menu, nativeImage, app } from 'electron';
import { join } from 'path';

let tray: Tray | null = null;

export function createTray(
  onCapture: () => void,
  onSettings: () => void
): void {
  // Create a 16x16 tray icon programmatically (OffMind terracotta circle)
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);

  // Draw a filled circle (terracotta color #c2410c = rgb(194, 65, 12))
  const cx = size / 2;
  const cy = size / 2;
  const r = 6;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      if (dist <= r) {
        // Anti-aliased edge
        const alpha = dist > r - 1 ? Math.max(0, Math.min(255, (r - dist) * 255)) : 255;
        canvas[idx] = 194;     // R
        canvas[idx + 1] = 65;  // G
        canvas[idx + 2] = 12;  // B
        canvas[idx + 3] = Math.round(alpha); // A
      } else {
        canvas[idx] = 0;
        canvas[idx + 1] = 0;
        canvas[idx + 2] = 0;
        canvas[idx + 3] = 0;
      }
    }
  }

  const icon = nativeImage.createFromBuffer(canvas, { width: size, height: size });

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
  tray.on('click', onCapture);
}

export function updateTrayIcon(hasQueuedItems: boolean): void {
  if (tray) {
    tray.setToolTip(
      hasQueuedItems
        ? 'OffMind Capture (items queued)'
        : 'OffMind Capture'
    );
  }
}
