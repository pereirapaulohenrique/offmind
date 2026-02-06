import Store from 'electron-store';

export function createStore() {
  return new Store({
    name: 'offmind-capture-config',
    defaults: {
      apiKey: '',
      apiUrl: 'https://offmind.ai',
      shortcut: 'CommandOrControl+Shift+Space',
      launchAtLogin: false,
      theme: 'dark',
      offlineQueue: [],
    },
    encryptionKey: 'offmind-capture-v1',
  });
}
