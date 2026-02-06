// OffMind Extension Popup

document.addEventListener('DOMContentLoaded', async () => {
  const setupView = document.getElementById('setup-view');
  const captureView = document.getElementById('capture-view');
  const apiKeyInput = document.getElementById('api-key');
  const saveKeyBtn = document.getElementById('save-key');
  const captureText = document.getElementById('capture-text');
  const captureNotes = document.getElementById('capture-notes');
  const captureBtn = document.getElementById('capture-btn');
  const status = document.getElementById('status');
  const settingsLink = document.getElementById('settings-link');

  // Check if API key is set
  const { apiKey } = await chrome.storage.sync.get(['apiKey']);

  if (apiKey) {
    showCaptureView();
  } else {
    showSetupView();
  }

  function showSetupView() {
    setupView.style.display = 'block';
    captureView.style.display = 'none';
  }

  function showCaptureView() {
    setupView.style.display = 'none';
    captureView.style.display = 'block';
    captureText.focus();
  }

  // Save API key
  saveKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      alert('Please enter an API key');
      return;
    }

    await chrome.storage.sync.set({ apiKey: key });
    showCaptureView();
  });

  // Capture item
  captureBtn.addEventListener('click', async () => {
    const title = captureText.value.trim();
    if (!title) {
      showStatus('Please enter something to capture', 'error');
      return;
    }

    captureBtn.disabled = true;
    captureBtn.textContent = 'Capturing...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'capture',
        title,
        notes: captureNotes.value.trim(),
      });

      if (response.success) {
        showStatus('Captured!', 'success');
        captureText.value = '';
        captureNotes.value = '';

        // Close popup after brief delay
        setTimeout(() => window.close(), 1000);
      } else {
        showStatus(response.error || 'Capture failed', 'error');
      }
    } catch (error) {
      showStatus('Capture failed', 'error');
    } finally {
      captureBtn.disabled = false;
      captureBtn.textContent = 'Capture';
    }
  });

  // Handle enter key in textarea
  captureText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      captureBtn.click();
    }
  });

  // Settings link - clear API key
  settingsLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Reset API key?')) {
      await chrome.storage.sync.remove(['apiKey']);
      showSetupView();
    }
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;

    if (type === 'success') {
      setTimeout(() => {
        status.textContent = '';
        status.className = 'status';
      }, 3000);
    }
  }

  // Get selected text from current tab if any
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection()?.toString() || '',
      });

      if (results[0]?.result) {
        captureText.value = results[0].result;
        captureNotes.value = tab.url || '';
      }
    }
  } catch (error) {
    // Ignore errors from restricted pages
  }
});
