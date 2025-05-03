let lastUnlockedUrl = "";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url !== lastUnlockedUrl) {
    chrome.storage.local.set({ unlockGranted: false });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "unlock") {
    lastUnlockedUrl = message.url;
  }
});