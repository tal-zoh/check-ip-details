// background.js
// Purpose: Registers the context menu item and handles the click to inject the content script and trigger IP lookup popup.

chrome.runtime.onInstalled.addListener(() => {
  // Add context menu item for selected IP
  chrome.contextMenus.create({
    id: "checkIpLocation",
    title: "Check IP details for \"%s\"",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // When the context menu item is clicked
  if (info.menuItemId === "checkIpLocation" && info.selectionText) {
    const ipRegex = new RegExp(
      // Match IPv4
      '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|' +
      // Match full IPv6
      '^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|' +
      // Match shortened IPv6
      '^(?:[0-9a-fA-F]{1,4}:){1,7}:$|' +
      '^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$'
    );

    const selectedIp = info.selectionText.trim();

    // If it's a valid IP, inject the popup script and styles
    if (ipRegex.test(selectedIp)) {
      chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["style.css"] });
      chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] }, () => {
        chrome.tabs.sendMessage(tab.id, { type: "SHOW_IP_DETAILS_POPUP", ip: selectedIp });
      });
    }
  }
});
