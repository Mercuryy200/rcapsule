// ============================================================================
// BACKGROUND SERVICE WORKER
// Handles keyboard shortcuts and background tasks
// ============================================================================

// Handle keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "scan-page") {
    // Open popup when scan shortcut is pressed
    chrome.action.openPopup();
  } else if (command === "open-popup") {
    // Open popup when general shortcut is pressed
    chrome.action.openPopup();
  }
});

// Handle extension icon click (optional: could trigger scan directly)
chrome.action.onClicked.addListener(async (tab) => {
  // This only fires if no popup is set, but we have a popup
  // Keep this for future use if needed
  console.log("Extension clicked on tab:", tab.id);
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkOnlineStatus") {
    // Check if browser is online
    sendResponse({ online: navigator.onLine });
    return true;
  }

  if (request.action === "getRateLimitStatus") {
    // Could implement rate limit checking here
    // For now, just acknowledge
    sendResponse({ limited: false });
    return true;
  }
});

// Optional: Badge to show offline status
chrome.runtime.onInstalled.addListener(() => {
  console.log("Wardrobe Import extension installed");
});

// Monitor online/offline status
self.addEventListener("online", () => {
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setBadgeBackgroundColor({ color: "#10b981" });
});

self.addEventListener("offline", () => {
  chrome.action.setBadgeText({ text: "!" });
  chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
});
