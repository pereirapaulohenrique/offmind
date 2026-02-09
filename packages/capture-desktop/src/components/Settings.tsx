import { useEffect, useState, useCallback } from 'react';

type AuthMode = 'password' | 'magic-link';

export function Settings() {
  const [userEmail, setUserEmail] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [shortcut, setShortcut] = useState('CommandOrControl+Shift+Space');
  const [launchAtLogin, setLaunchAtLogin] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recordingShortcut, setRecordingShortcut] = useState(false);

  // Auth form state
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('password');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const loadSettings = useCallback(async () => {
    const settings = await window.offmind.getSettings();
    setIsSignedIn(!!settings.accessToken);
    setUserEmail(settings.userEmail || '');
    setShortcut(settings.shortcut);
    setLaunchAtLogin(settings.launchAtLogin);
  }, []);

  useEffect(() => {
    loadSettings();
    const cleanup = window.offmind.onAuthUpdated(() => {
      loadSettings();
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
      setAuthError('');
    });
    return cleanup;
  }, [loadSettings]);

  const handleSignIn = useCallback(async () => {
    if (!loginEmail) {
      setAuthError('Please enter your email');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    if (authMode === 'password') {
      if (!loginPassword) {
        setAuthError('Please enter your password');
        setAuthLoading(false);
        return;
      }
      const result = await window.offmind.signIn(loginEmail, loginPassword);
      if (result.success) {
        setShowLogin(false);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setAuthError(result.error || 'Sign in failed');
      }
    } else {
      const result = await window.offmind.sendMagicLink(loginEmail);
      if (result.success) {
        setAuthSuccess('Check your email for the magic link! After clicking it, reopen this app.');
      } else {
        setAuthError(result.error || 'Failed to send magic link');
      }
    }

    setAuthLoading(false);
  }, [loginEmail, loginPassword, authMode]);

  const handleSignOut = useCallback(() => {
    window.offmind.signOut();
  }, []);

  const handleSave = useCallback(async () => {
    await window.offmind.setSettings({ shortcut, launchAtLogin });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [shortcut, launchAtLogin]);

  const handleClose = useCallback(() => {
    window.offmind.closeSettings();
  }, []);

  const handleShortcutKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!recordingShortcut) return;
      e.preventDefault();
      e.stopPropagation();
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');
      let key = e.key;
      if (key === ' ') key = 'Space';
      else if (key.length === 1) key = key.toUpperCase();
      parts.push(key);
      setShortcut(parts.join('+'));
      setRecordingShortcut(false);
    },
    [recordingShortcut]
  );

  const handleLoginKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSignIn();
      }
    },
    [handleSignIn]
  );

  const displayShortcut = shortcut
    .replace('CommandOrControl', 'Ctrl')
    .replace('Shift', 'Shift')
    .replace('Alt', 'Alt')
    .replace('Space', 'Space')
    .replace(/\+/g, ' + ');

  return (
    <div className="settings-container">
      {/* Title bar (draggable) */}
      <div className="settings-header">
        <span className="text-sm font-semibold">OffMind Capture</span>
        <button onClick={handleClose} className="btn-ghost" style={{ padding: '4px 8px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="settings-body">
        {/* Account */}
        <div className="settings-section">
          <div className="settings-section-title">Account</div>

          {isSignedIn ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {userEmail}
                </p>
                <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>
                  Connected
                </p>
              </div>
              <button className="btn-ghost btn-danger" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          ) : showLogin ? (
            <div className="auth-form">
              {/* Auth mode tabs */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${authMode === 'password' ? 'auth-tab--active' : ''}`}
                  onClick={() => { setAuthMode('password'); setAuthError(''); setAuthSuccess(''); }}
                >
                  Password
                </button>
                <button
                  className={`auth-tab ${authMode === 'magic-link' ? 'auth-tab--active' : ''}`}
                  onClick={() => { setAuthMode('magic-link'); setAuthError(''); setAuthSuccess(''); }}
                >
                  Magic Link
                </button>
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="settings-label">Email</label>
                <input
                  type="email"
                  className="settings-input"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={handleLoginKeyDown}
                  autoFocus
                  disabled={authLoading}
                />
              </div>

              {authMode === 'password' && (
                <div style={{ marginTop: 10 }}>
                  <label className="settings-label">Password</label>
                  <input
                    type="password"
                    className="settings-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={handleLoginKeyDown}
                    disabled={authLoading}
                  />
                </div>
              )}

              {authError && (
                <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 8 }}>
                  {authError}
                </p>
              )}

              {authSuccess && (
                <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 8 }}>
                  {authSuccess}
                </p>
              )}

              <div className="flex items-center gap-2" style={{ marginTop: 12 }}>
                <button
                  className="btn-primary"
                  onClick={handleSignIn}
                  disabled={authLoading}
                  style={{ flex: 1, opacity: authLoading ? 0.6 : 1 }}
                >
                  {authLoading
                    ? 'Signing in...'
                    : authMode === 'password'
                      ? 'Sign In'
                      : 'Send Magic Link'
                  }
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => { setShowLogin(false); setAuthError(''); setAuthSuccess(''); }}
                  disabled={authLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button className="btn-primary w-full" onClick={() => setShowLogin(true)}>
                Sign in with OffMind
              </button>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                Sign in with your OffMind account
              </p>
            </div>
          )}
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
                  borderColor: recordingShortcut ? 'var(--accent-base)' : undefined,
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
            {saved ? 'Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
