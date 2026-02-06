import { useEffect, useRef, useState, useCallback } from 'react';
import { captureItem, retryQueuedItems } from '../lib/api';

type Status = 'idle' | 'sending' | 'success' | 'error' | 'queued' | 'no-key';

export function CaptureInput() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [statusText, setStatusText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus on mount and when main process signals
  useEffect(() => {
    const cleanup = window.offmind.onCaptureFocus(() => {
      textareaRef.current?.focus();
    });
    return cleanup;
  }, []);

  // Reset state when window is hidden
  useEffect(() => {
    const cleanup = window.offmind.onCaptureReset(() => {
      setValue('');
      setStatus('idle');
      setStatusText('');
      // Reset window height
      window.offmind.resizeCapture(72);
    });
    return cleanup;
  }, []);

  // Retry queued items on mount
  useEffect(() => {
    retryQueuedItems().then((remaining) => {
      if (remaining > 0) {
        setStatusText(`${remaining} queued`);
      }
    });
  }, []);

  // Auto-resize textarea and window
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;

    // Tell main process to resize the window
    // 72 = base height (padding + single line), expand as content grows
    const newHeight = Math.max(72, Math.min(scrollHeight + 36, 220));
    window.offmind.resizeCapture(newHeight);
  }, []);

  const handleSubmit = useCallback(async () => {
    const text = value.trim();
    if (!text || status === 'sending') return;

    setStatus('sending');
    setStatusText('');

    const result = await captureItem({ title: text });

    if (result.success) {
      if (result.queued) {
        setStatus('queued');
        setStatusText('Saved offline');
      } else {
        setStatus('success');
        setStatusText('Captured');
      }

      // Brief flash then hide
      setTimeout(() => {
        window.offmind.hideCapture();
      }, 400);
    } else if (result.error === 'No API key configured') {
      setStatus('no-key');
      setStatusText('Set up API key');
    } else {
      setStatus('error');
      setStatusText(result.error || 'Failed');
      // Clear error after a moment
      setTimeout(() => {
        setStatus('idle');
        setStatusText('');
      }, 2000);
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

  const handleOpenSettings = useCallback(() => {
    window.offmind.openSettings();
  }, []);

  const statusDotClass =
    status === 'idle'
      ? 'status-dot--idle'
      : status === 'sending'
        ? 'status-dot--sending'
        : status === 'success'
          ? 'status-dot--success'
          : status === 'queued'
            ? 'status-dot--success'
            : 'status-dot--error';

  return (
    <div
      ref={containerRef}
      className={`capture-container ${status === 'success' ? 'animate-success' : ''}`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Capture icon */}
        <div className="mt-0.5 flex-shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            style={{ color: status === 'idle' ? 'var(--text-muted)' : 'var(--layer-capture)' }}
          >
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            className="capture-input"
            placeholder="What's on your mind?"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            autoFocus
            spellCheck
          />
        </div>

        {/* Right side: status + hints */}
        <div className="flex-shrink-0 flex items-center gap-2 mt-0.5">
          {status === 'no-key' ? (
            <button
              onClick={handleOpenSettings}
              className="text-xs font-medium"
              style={{ color: 'var(--accent-base)' }}
            >
              Settings
            </button>
          ) : statusText ? (
            <span
              className="text-xs"
              style={{
                color:
                  status === 'error'
                    ? 'var(--error)'
                    : status === 'success' || status === 'queued'
                      ? 'var(--success)'
                      : 'var(--text-muted)',
              }}
            >
              {statusText}
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className={`status-dot ${statusDotClass}`} />
              <span className="kbd">&#9166;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
