import { useEffect, useState } from 'react';
import { CaptureInput } from './components/CaptureInput';
import { Settings } from './components/Settings';

export function App() {
  const [route, setRoute] = useState<'capture' | 'settings'>('capture');

  useEffect(() => {
    // Hash-based routing for Electron windows
    const hash = window.location.hash;
    if (hash === '#/settings') {
      setRoute('settings');
    }

    const onHashChange = () => {
      setRoute(window.location.hash === '#/settings' ? 'settings' : 'capture');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === 'settings') {
    return <Settings />;
  }

  return <CaptureInput />;
}
