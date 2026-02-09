import Store from 'electron-store';

export function createStore() {
  return new Store({
    name: 'offmind-capture-config',
    defaults: {
      accessToken: '',
      refreshToken: '',
      tokenExpiresAt: 0,
      userId: '',
      userEmail: '',
      apiUrl: 'https://mindbase.vercel.app',
      supabaseUrl: 'https://xxipgnrcxyagxsfnulwo.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4aXBnbnJjeHlhZ3hzZm51bHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTA4OTUsImV4cCI6MjA4NTg2Njg5NX0.leMdIfZPdGUU7YDI8DbPjk9vw17m3nQrMxkWiWb3PHs',
      shortcut: 'CommandOrControl+Shift+Space',
      launchAtLogin: false,
      theme: 'dark',
      offlineQueue: [],
      draft: '',
    },
    encryptionKey: 'offmind-capture-v1',
  });
}
