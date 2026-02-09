import { useEffect, useRef, useState, useCallback } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error' | 'queued' | 'no-key';

export function CaptureInput() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [statusText, setStatusText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const BASE_HEIGHT = 110;
  const MAX_HEIGHT = 260;

  // Auto-resize textarea and window
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;

    const newHeight = Math.max(BASE_HEIGHT, Math.min(scrollHeight + 64, MAX_HEIGHT));
    window.offmind.resizeCapture(newHeight);
  }, []);

  // Focus on mount and when main process signals
  useEffect(() => {
    const cleanup = window.offmind.onCaptureFocus(() => {
      textareaRef.current?.focus();
    });
    return cleanup;
  }, []);

  // Load saved draft on mount
  useEffect(() => {
    window.offmind.getDraft().then((draft) => {
      if (draft) {
        setValue(draft);
        setTimeout(adjustHeight, 0);
      }
    });
  }, [adjustHeight]);

  // Reset state when window is hidden
  useEffect(() => {
    const cleanup = window.offmind.onCaptureReset(() => {
      setStatus('idle');
      setStatusText('');
    });
    return cleanup;
  }, []);

  const handleSubmit = useCallback(async () => {
    const text = value.trim();
    if (!text || status === 'sending') return;

    setStatus('sending');
    setStatusText('Sending...');

    try {
      const result = await window.offmind.sendCapture(text);

      if (result.success) {
        if (result.queued) {
          setStatus('queued');
          setStatusText('Saved offline');
        } else {
          setStatus('success');
          setStatusText('Captured!');
        }

        setValue('');
        window.offmind.setDraft('');
        window.offmind.resizeCapture(BASE_HEIGHT);

        setTimeout(() => {
          setStatus('idle');
          setStatusText('');
        }, 1500);
      } else if (result.error === 'Not signed in') {
        setStatus('no-key');
        setStatusText('Sign in required');
      } else {
        setStatus('error');
        setStatusText(result.error || 'Failed');
        setTimeout(() => {
          setStatus('idle');
          setStatusText('');
        }, 3000);
      }
    } catch (err) {
      setStatus('error');
      setStatusText('Network error');
      setTimeout(() => {
        setStatus('idle');
        setStatusText('');
      }, 3000);
    }
  }, [value, status]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        window.offmind.hideCapture();
      }
    },
    [handleSubmit]
  );

  const hasText = value.trim().length > 0;

  return (
    <div className="capture-window">
      <div
        ref={containerRef}
        className={`capture-container ${status === 'success' ? 'animate-success' : ''}`}
      >
        {/* Input row */}
        <div className="capture-body">
          <textarea
            ref={textareaRef}
            className="capture-input"
            placeholder="What's on your mind?"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              setValue(newValue);
              adjustHeight();

              if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
              draftTimerRef.current = setTimeout(() => {
                window.offmind.setDraft(newValue);
              }, 300);
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            autoFocus
            spellCheck
          />
        </div>

        {/* Footer: status left, actions right */}
        <div className="capture-footer">
          <div className="capture-footer-left">
            {statusText ? (
              <span
                className="capture-status-text"
                style={{
                  color:
                    status === 'error'
                      ? 'var(--error)'
                      : status === 'success' || status === 'queued'
                        ? 'var(--success)'
                        : status === 'sending'
                          ? 'var(--layer-capture)'
                          : 'var(--text-muted)',
                }}
              >
                {status === 'sending' && <span className="status-dot status-dot--sending" />}
                {statusText}
              </span>
            ) : (
              <span className="capture-hint">
                <span className="kbd">Enter</span> to send
                <span style={{ margin: '0 4px', color: 'var(--text-disabled)' }}>·</span>
                <span className="kbd">Shift+Enter</span> new line
              </span>
            )}
          </div>

          <div className="capture-footer-right">
            {status === 'no-key' ? (
              <button
                onClick={() => window.offmind.openSettings()}
                className="capture-action-btn"
                style={{ color: 'var(--accent-base)' }}
              >
                Sign in
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className={`capture-send-btn ${hasText ? 'capture-send-btn--active' : ''}`}
                disabled={!hasText || status === 'sending'}
                title="Send (Enter)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2.5 8H13.5M13.5 8L9 3.5M13.5 8L9 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={() => window.offmind.hideCapture()}
              className="close-btn"
              title="Close (Esc)"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
