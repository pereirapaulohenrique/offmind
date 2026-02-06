// OffMind Browser Extension - Background Service Worker

const API_BASE = 'http://localhost:3000'; // Change to production URL when deploying

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'capture-selection',
    title: 'Capture to OffMind',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'capture-page',
    title: 'Capture page to OffMind',
    contexts: ['page'],
  });

  chrome.contextMenus.create({
    id: 'capture-link',
    title: 'Capture link to OffMind',
    contexts: ['link'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let title = '';
  let notes = '';

  switch (info.menuItemId) {
    case 'capture-selection':
      title = info.selectionText || '';
      notes = `Source: ${tab?.url || 'Unknown'}`;
      break;

    case 'capture-page':
      title = tab?.title || 'Untitled page';
      notes = tab?.url || '';
      break;

    case 'capture-link':
      title = info.linkUrl || '';
      notes = `From: ${tab?.url || 'Unknown'}`;
      break;
  }

  if (title) {
    await captureToOffMind(title, notes);
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capture') {
    captureToOffMind(request.title, request.notes)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'getApiKey') {
    chrome.storage.sync.get(['apiKey'], (result) => {
      sendResponse({ apiKey: result.apiKey });
    });
    return true;
  }

  if (request.action === 'setApiKey') {
    chrome.storage.sync.set({ apiKey: request.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Capture function
async function captureToOffMind(title, notes = '') {
  try {
    const { apiKey } = await chrome.storage.sync.get(['apiKey']);

    if (!apiKey) {
      // Show notification to set up API key
      showNotification('Setup Required', 'Please set your API key in the extension popup.');
      return { success: false, error: 'API key not set' };
    }

    const response = await fetch(`${API_BASE}/api/extension/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ title, notes }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Capture failed');
    }

    showNotification('Captured!', title.substring(0, 50) + (title.length > 50 ? '...' : ''));
    return { success: true };
  } catch (error) {
    console.error('Capture error:', error);
    showNotification('Capture Failed', error.message);
    return { success: false, error: error.message };
  }
}

// Show notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message,
  });
}
