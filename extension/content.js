// OffMind Content Script
// Adds keyboard shortcut and selection capture

// Keyboard shortcut: Ctrl/Cmd + Shift + M
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'm') {
    e.preventDefault();

    const selection = window.getSelection()?.toString().trim();
    if (selection) {
      chrome.runtime.sendMessage({
        action: 'capture',
        title: selection,
        notes: `Source: ${window.location.href}`,
      });
    } else {
      // Open popup if no selection
      chrome.runtime.sendMessage({ action: 'openPopup' });
    }
  }
});
