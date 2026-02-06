import { useEffect, useState, useCallback } from 'react';

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('https://offmind.ai');
  const [shortcut, setShortcut] = useState('CommandOrControl+Shift+Space');
  const [launchAtLogin, setLaunchAtLogin] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recordingShortcut, setRecordingShortcut] = useState(false);

  // Load settings on mount
  useEffect(() => {
    window.offmind.getSettings().then((settings) => {
      setApiKey(settings.apiKey);
      setApiUrl(settings.apiUrl);
      setShortcut(settings.shortcut);
      setLaunchAtLogin(settings.launchAtLogin);
    });
  }, []);

  const handleSave = useCallback(async () => {
    await window.offmind.setSettings({
      apiKey,
      apiUrl,
      shortcut,
      launchAtLogin,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [apiKey, apiUrl, shortcut, launchAtLogin]);

  const handleClose = useCallback(() => {
    window.offmind.closeSettings();
  }, []);

  const handleShortcutKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!recordingShortcut) return;

      e.preventDefault();
      e.stopPropagation();

      // Ignore modifier-only presses
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');

      // Map key names
      let key = e.key;
      if (key === ' ') key = 'Space';
      else if (key.length === 1) key = key.toUpperCase();

      parts.push(key);
      setShortcut(parts.join('+'));
      setRecordingShortcut(false);
    },
    [recordingShortcut]
  );

  const displayShortcut = shortcut
    .replace('CommandOrControl', '⌘')
    .replace('Shift', '⇧')
    .replace('Alt', '⌥')
    .replace('Space', '␣')
    .replace(/\+/g, ' ');

  return (
    <div className="settings-container">
      {/* Title bar (draggable) */}
      <div className="settings-header">
        <span className="text-sm font-semibold">OffMind Capture Settings</span>
        <button onClick={handleClose} className="btn-ghost" style={{ padding: '4px 8px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3L11 11M11 3L3 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="settings-body">
        {/* Connection */}
        <div className="settings-section">
          <div className="settings-section-title">Connection</div>

          <div style={{ marginBottom: 16 }}>
            <label className="settings-label">API Key</label>
            <input
              type="password"
              className="settings-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key from offmind.ai/settings"
            />
            <p
              className="mt-1.5"
              style={{ fontSize: 11, color: 'var(--text-muted)' }}
            >
              Find your key at Settings &rarr; API &amp; Integrations in the web app
            </p>
          </div>

          <div>
            <label className="settings-label">Server URL</label>
            <input
              className="settings-input"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://offmind.ai"
            />
          </div>
        </div>

        {/* Shortcut */}
        <div className="settings-section">
          <div className="settings-section-title">Global Shortcut</div>

          <div>
            <label className="settings-label">Capture Hotkey</label>
            <div className="flex items-center gap-2">
              <button
                className="settings-input"
                onClick={() => setRecordingShortcut(true)}
                onKeyDown={handleShortcutKeyDown}
                onBlur={() => setRecordingShortcut(false)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  borderColor: recordingShortcut
                    ? 'var(--accent-base)'
                    : undefined,
                }}
              >
                {recordingShortcut ? (
                  <span style={{ color: 'var(--accent-base)' }}>Press new shortcut...</span>
                ) : (
                  <span>{displayShortcut}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <div className="settings-section-title">Preferences</div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Launch at login
              </span>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Start OffMind Capture when you log in
              </p>
            </div>
            <button
              className={`toggle ${launchAtLogin ? 'toggle--active' : ''}`}
              onClick={() => setLaunchAtLogin(!launchAtLogin)}
            >
              <div className="toggle-knob" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <button className="btn-ghost" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
