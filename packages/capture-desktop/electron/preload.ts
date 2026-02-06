import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('offmind', {
  // Capture window
  hideCapture: () => ipcRenderer.send('capture:hide'),
  resizeCapture: (height: number) => ipcRenderer.send('capture:resize', height),

  onCaptureFocus: (callback: () => void) => {
    ipcRenderer.on('capture:focus', callback);
    return () => ipcRenderer.removeListener('capture:focus', callback);
  },

  onCaptureReset: (callback: () => void) => {
    ipcRenderer.on('capture:reset', callback);
    return () => ipcRenderer.removeListener('capture:reset', callback);
  },

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke('settings:set', settings),
  openSettings: () => ipcRenderer.send('settings:open'),
  closeSettings: () => ipcRenderer.send('settings:close'),

  // Offline queue
  getQueue: () => ipcRenderer.invoke('queue:get'),
  addToQueue: (item: unknown) => ipcRenderer.invoke('queue:add', item),
  clearQueue: () => ipcRenderer.invoke('queue:clear'),
  removeFromQueue: (index: number) => ipcRenderer.invoke('queue:remove', index),
});
