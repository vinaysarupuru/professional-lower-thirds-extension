// Create and manage the lower third label and brand element
let labelElement = null;
let brandElement = null;
let currentTabId = null;

// Initialize on page load
initializeLabel();

function initializeLabel() {
  // Get tab ID from background script
  chrome.runtime.sendMessage({action: 'getTabId'}, function(response) {
    if (chrome.runtime.lastError) {
      console.log('Error getting tab ID:', chrome.runtime.lastError);
      return;
    }
    
    if (response && response.tabId) {
      currentTabId = response.tabId;
      const tabKey = `tab_${response.tabId}`;
      
      // Load saved settings
      chrome.storage.local.get([tabKey], function(result) {
        if (chrome.runtime.lastError) {
          console.log('Error loading settings:', chrome.runtime.lastError);
          return;
        }
        
        if (result[tabKey] && result[tabKey].enabled) {
          createOrUpdateLabel(result[tabKey].text, true, result[tabKey].style);
        }
      });
    }
  });
  
  // Also load brand settings on initialization
  loadBrandSettings();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Content script received message:', request);
  
  if (request.action === 'updateLabel') {
    createOrUpdateLabel(request.text, request.enabled, request.style);
    sendResponse({success: true});
  } else if (request.action === 'updateBrand') {
    createOrUpdateBrand(request.brandSettings);
    sendResponse({success: true});
  }
  return true; // Keep message channel open for async response
});

function createOrUpdateLabel(text, enabled, style = 'default') {
  console.log('Creating/updating label:', { text, enabled, style });
  
  // Remove existing label if any
  if (labelElement) {
    labelElement.remove();
    labelElement = null;
  }
  
  // Create new label if enabled
  if (enabled && text) {
    // Ensure we're injecting into the main document, not an iframe
    const targetDocument = document;
    const targetBody = targetDocument.body;
    
    if (!targetBody) {
      console.log('Document body not ready, retrying...');
      setTimeout(() => createOrUpdateLabel(text, enabled, style), 100);
      return;
    }
    
    labelElement = targetDocument.createElement('div');
    labelElement.id = 'tab-lower-third-label';
    
    // Apply theme class
    const themeClass = style === 'default' ? 'lower-third-label' : `lower-third-label theme-${style}`;
    labelElement.className = themeClass;
    
    labelElement.innerHTML = `
      <div class="label-content">
        <span class="label-text">${escapeHtml(text)}</span>
      </div>
    `;
    
    // Append to body
    targetBody.appendChild(labelElement);
    console.log('Label element added to DOM:', labelElement);
    
    // Add animation class after a brief delay
    setTimeout(() => {
      if (labelElement) {
        labelElement.classList.add('show');
        console.log('Label animation class added');
      }
    }, 50);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Brand element functions
function loadBrandSettings() {
  // Load both global and tab-specific brand settings
  const tabBrandKey = currentTabId ? `brandTab_${currentTabId}` : null;
  const storageKeys = ['brandSettings'];
  if (tabBrandKey) {
    storageKeys.push(tabBrandKey);
  }
  
  chrome.storage.local.get(storageKeys, function(result) {
    const globalBrand = result.brandSettings || {};
    const tabBrand = tabBrandKey ? (result[tabBrandKey] || {}) : {};
    
    // Tab-specific brand takes precedence over global brand
    let activeBrand = null;
    if (tabBrand.enabled) {
      activeBrand = tabBrand;
    } else if (globalBrand.enabled) {
      activeBrand = globalBrand;
    }
    
    if (activeBrand) {
      createOrUpdateBrand(activeBrand);
    } else {
      // Remove brand if none is active
      if (brandElement) {
        brandElement.remove();
        brandElement = null;
      }
    }
  });
}

function createOrUpdateBrand(brandSettings) {
  console.log('Creating/updating brand:', brandSettings);
  
  // Remove existing brand if any
  if (brandElement) {
    brandElement.remove();
    brandElement = null;
  }
  
  // Create new brand if enabled
  if (brandSettings && brandSettings.enabled) {
    const targetDocument = document;
    const targetBody = targetDocument.body;
    
    if (!targetBody) {
      console.log('Document body not ready, retrying brand...');
      setTimeout(() => createOrUpdateBrand(brandSettings), 100);
      return;
    }
    
    brandElement = targetDocument.createElement('div');
    brandElement.id = 'tab-brand-element';
    
    // Apply style class
    const styleClass = brandSettings.style === 'default' ? '' : `brand-style-${brandSettings.style}`;
    brandElement.className = styleClass;
    
    // Create content based on type
    let contentHTML = '';
    if (brandSettings.type === 'logo' && brandSettings.logoData) {
      contentHTML = `
        <div class="brand-content">
          <img src="${brandSettings.logoData}" alt="Brand Logo" class="brand-logo-img">
        </div>
      `;
    } else if (brandSettings.text) {
      contentHTML = `
        <div class="brand-content">
          <span class="brand-text">${escapeHtml(brandSettings.text)}</span>
        </div>
      `;
    }
    
    brandElement.innerHTML = contentHTML;
    
    // Append to body
    targetBody.appendChild(brandElement);
    console.log('Brand element added to DOM:', brandElement);
    
    // Add animation class after a brief delay
    setTimeout(() => {
      if (brandElement) {
        brandElement.classList.add('show');
        console.log('Brand animation class added');
      }
    }, 50);
  }
}

// Re-check label on navigation (for single-page applications)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(initializeLabel, 100);
  }
}).observe(document, {subtree: true, childList: true});