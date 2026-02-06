const { offmind } = window;

interface CapturePayload {
  title: string;
  notes?: string;
}

interface CaptureResult {
  success: boolean;
  error?: string;
  queued?: boolean;
}

export async function captureItem(payload: CapturePayload): Promise<CaptureResult> {
  const settings = await offmind.getSettings();

  if (!settings.apiKey) {
    return { success: false, error: 'No API key configured' };
  }

  try {
    const response = await fetch(`${settings.apiUrl}/api/extension/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        title: payload.title,
        notes: payload.notes || undefined,
        source: 'desktop',
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    // Flush any queued items now that we're online
    drainQueue(settings.apiKey, settings.apiUrl);

    return { success: true };
  } catch (err) {
    // Network error → queue for later
    const queueItem: QueueItem = {
      title: payload.title,
      notes: payload.notes,
      timestamp: Date.now(),
    };

    await offmind.addToQueue(queueItem);
    return { success: true, queued: true };
  }
}

/**
 * Try to send all queued items. Runs in background, non-blocking.
 */
async function drainQueue(apiKey: string, apiUrl: string): Promise<void> {
  const queue = await offmind.getQueue();
  if (queue.length === 0) return;

  const failed: number[] = [];

  for (let i = 0; i < queue.length; i++) {
    try {
      const response = await fetch(`${apiUrl}/api/extension/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          title: queue[i].title,
          notes: queue[i].notes || undefined,
          source: 'desktop',
        }),
      });

      if (!response.ok) {
        failed.push(i);
      }
    } catch {
      // Still offline for this one, stop trying
      break;
    }
  }

  // Clear successfully sent items
  if (failed.length === 0) {
    await offmind.clearQueue();
  }
}

/**
 * Attempt to drain the queue on startup if we have connectivity.
 */
export async function retryQueuedItems(): Promise<number> {
  const settings = await offmind.getSettings();
  if (!settings.apiKey) return 0;

  const queue = await offmind.getQueue();
  if (queue.length === 0) return 0;

  await drainQueue(settings.apiKey, settings.apiUrl);
  const remaining = await offmind.getQueue();
  return remaining.length;
}
