// Handle messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getTabId') {
    sendResponse({tabId: sender.tab.id});
  }
  return true;
});

// Clean up storage when tab is closed
chrome.tabs.onRemoved.addListener(function(tabId) {
  const tabKey = `tab_${tabId}`;
  chrome.storage.local.remove([tabKey]);
});

// Re-inject content script when tab is updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    const tabKey = `tab_${tabId}`;
    const tabBrandKey = `brandTab_${tabId}`;
    
    // Re-send lower third settings
    chrome.storage.local.get([tabKey], function(result) {
      if (result[tabKey] && result[tabKey].enabled) {
        chrome.tabs.sendMessage(tabId, {
          action: 'updateLabel',
          text: result[tabKey].text,
          style: result[tabKey].style || 'default',
          enabled: true
        }).catch(() => {
          // Ignore errors if content script isn't ready
        });
      }
    });
    
    // Re-send brand settings (global and tab-specific)
    chrome.storage.local.get(['brandSettings', tabBrandKey], function(result) {
      const globalBrand = result.brandSettings;
      const tabBrand = result[tabBrandKey];
      
      if (globalBrand && globalBrand.enabled) {
        chrome.tabs.sendMessage(tabId, {
          action: 'updateBrand',
          brandSettings: globalBrand
        }).catch(() => {
          // Ignore errors if content script isn't ready
        });
      } else if (tabBrand && tabBrand.enabled) {
        chrome.tabs.sendMessage(tabId, {
          action: 'updateBrand',
          brandSettings: tabBrand
        }).catch(() => {
          // Ignore errors if content script isn't ready
        });
      }
    });
  }
});