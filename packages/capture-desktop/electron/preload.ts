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

  // Auth
  signIn: (email: string, password: string) => ipcRenderer.invoke('auth:sign-in', email, password),
  sendMagicLink: (email: string) => ipcRenderer.invoke('auth:magic-link', email),
  signOut: () => ipcRenderer.send('auth:sign-out'),
  refreshToken: () => ipcRenderer.invoke('auth:refresh'),
  onAuthUpdated: (callback: () => void) => {
    ipcRenderer.on('auth:updated', callback);
    return () => ipcRenderer.removeListener('auth:updated', callback);
  },

  // Capture
  sendCapture: (title: string, notes?: string) =>
    ipcRenderer.invoke('capture:send', title, notes),

  // Offline queue
  getQueue: () => ipcRenderer.invoke('queue:get'),
  addToQueue: (item: unknown) => ipcRenderer.invoke('queue:add', item),
  clearQueue: () => ipcRenderer.invoke('queue:clear'),
  removeFromQueue: (index: number) => ipcRenderer.invoke('queue:remove', index),

  // Draft
  getDraft: () => ipcRenderer.invoke('draft:get'),
  setDraft: (text: string) => ipcRenderer.invoke('draft:set', text),
});
