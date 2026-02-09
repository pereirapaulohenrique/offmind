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

interface QueueItem {
  title: string;
  notes?: string;
  timestamp: number;
}

async function getValidToken(): Promise<string | null> {
  const settings = await offmind.getSettings();

  if (!settings.accessToken) return null;

  // Check if token is expired (with 60s buffer)
  const now = Math.floor(Date.now() / 1000);
  if (settings.tokenExpiresAt && now >= settings.tokenExpiresAt - 60) {
    // Try to refresh
    const refreshed = await offmind.refreshToken();
    if (!refreshed) return null;

    // Get updated settings
    const updated = await offmind.getSettings();
    return updated.accessToken || null;
  }

  return settings.accessToken;
}

export async function captureItem(payload: CapturePayload): Promise<CaptureResult> {
  const settings = await offmind.getSettings();
  const token = await getValidToken();

  if (!token) {
    return { success: false, error: 'Not signed in' };
  }

  try {
    const response = await fetch(`${settings.apiUrl}/api/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: payload.title,
        notes: payload.notes || undefined,
        source: 'desktop',
      }),
    });

    if (response.status === 401) {
      // Token expired, try refresh once
      const refreshed = await offmind.refreshToken();
      if (refreshed) {
        const updated = await offmind.getSettings();
        const retry = await fetch(`${settings.apiUrl}/api/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${updated.accessToken}`,
          },
          body: JSON.stringify({
            title: payload.title,
            notes: payload.notes || undefined,
            source: 'desktop',
          }),
        });

        if (retry.ok) {
          drainQueue(updated.accessToken, settings.apiUrl);
          return { success: true };
        }
      }
      return { success: false, error: 'Session expired. Please sign in again.' };
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    // Flush queued items
    drainQueue(token, settings.apiUrl);
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

async function drainQueue(accessToken: string, apiUrl: string): Promise<void> {
  const queue = await offmind.getQueue();
  if (queue.length === 0) return;

  for (let i = 0; i < queue.length; i++) {
    try {
      const response = await fetch(`${apiUrl}/api/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: queue[i].title,
          notes: queue[i].notes || undefined,
          source: 'desktop',
        }),
      });
      if (!response.ok) break;
    } catch {
      break;
    }
  }
  await offmind.clearQueue();
}

export async function retryQueuedItems(): Promise<number> {
  const token = await getValidToken();
  if (!token) return 0;

  const queue = await offmind.getQueue();
  if (queue.length === 0) return 0;

  const settings = await offmind.getSettings();
  await drainQueue(token, settings.apiUrl);
  const remaining = await offmind.getQueue();
  return remaining.length;
}
