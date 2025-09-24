let currentTabId = null;

// Get current tab and load its settings
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  const currentTab = tabs[0];
  currentTabId = currentTab.id;
  const tabKey = `tab_${currentTab.id}`;
  
  // Load saved settings for this tab (lower third)
  chrome.storage.local.get([tabKey], function(result) {
    if (result[tabKey]) {
      document.getElementById('labelText').value = result[tabKey].text || '';
      document.getElementById('toggleLabel').checked = result[tabKey].enabled || false;
      document.getElementById('styleSelect').value = result[tabKey].style || 'default';
      updateStatus(result[tabKey].enabled, result[tabKey].text, result[tabKey].style);
    } else {
      updateStatus(false, '', 'default');
    }
  });
  
  // Load brand settings (global and tab-specific)
  chrome.storage.local.get(['brandSettings', `brandTab_${currentTab.id}`], function(result) {
    const globalBrand = result.brandSettings || {};
    const tabBrand = result[`brandTab_${currentTab.id}`] || {};
    
    // Determine which brand settings to use (tab-specific takes precedence)
    const activeBrand = tabBrand.enabled ? tabBrand : globalBrand;
    
    // Load brand form values
    if (document.getElementById('toggleBrand')) {
      document.getElementById('toggleBrand').checked = activeBrand.enabled || false;
      document.getElementById('brandText').value = activeBrand.text || '';
      document.getElementById('brandStyle').value = activeBrand.style || 'default';
      
      // Set brand type
      const brandType = activeBrand.type || 'text';
      const brandTypeRadio = document.querySelector(`input[name="brandType"][value="${brandType}"]`);
      if (brandTypeRadio) {
        brandTypeRadio.checked = true;
        toggleBrandType(brandType);
      }
      
      // Set brand scope based on which storage was used
      let brandScope = 'all'; // default
      if (tabBrand.enabled) {
        brandScope = 'current';
      } else if (globalBrand.enabled && globalBrand.scope) {
        brandScope = globalBrand.scope;
      }
      
      const brandScopeRadio = document.querySelector(`input[name="brandScope"][value="${brandScope}"]`);
      if (brandScopeRadio) {
        brandScopeRadio.checked = true;
      }
      
      // Load logo if exists
      if (brandType === 'logo' && activeBrand.logoData) {
        displayLogoPreview(activeBrand.logoData);
      } else {
        // Clear logo preview if no logo
        const preview = document.getElementById('logoPreview');
        if (preview) {
          preview.innerHTML = '<span class="empty">No logo selected</span>';
          preview.classList.add('empty');
        }
      }
    }
  });
});

// Lower Third Label Handlers
document.getElementById('enableBtn').addEventListener('click', function() {
  const labelText = document.getElementById('labelText').value.trim();
  const selectedStyle = document.getElementById('styleSelect').value;
  
  if (!labelText) {
    document.getElementById('status').textContent = '⚠️ Please enter a label text';
    document.getElementById('status').className = 'status';
    return;
  }
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const tabKey = `tab_${currentTab.id}`;
    
    const settings = {
      text: labelText,
      style: selectedStyle,
      enabled: true,
      url: currentTab.url
    };
    
    chrome.storage.local.set({[tabKey]: settings}, function() {
      chrome.tabs.sendMessage(currentTab.id, {
        action: 'updateLabel',
        text: labelText,
        style: selectedStyle,
        enabled: true
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.log('Error sending message to content script:', chrome.runtime.lastError);
          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content.js']
          }, function() {
            if (!chrome.runtime.lastError) {
              setTimeout(() => {
                chrome.tabs.sendMessage(currentTab.id, {
                  action: 'updateLabel',
                  text: labelText,
                  style: selectedStyle,
                  enabled: true
                });
              }, 100);
            }
          });
        }
      });
      
      document.getElementById('toggleLabel').checked = true;
      updateStatus(true, labelText, selectedStyle);
    });
  });
});

document.getElementById('disableBtn').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const tabKey = `tab_${currentTab.id}`;
    
    chrome.storage.local.get([tabKey], function(result) {
      const settings = result[tabKey] || {};
      settings.enabled = false;
      
      chrome.storage.local.set({[tabKey]: settings}, function() {
        chrome.tabs.sendMessage(currentTab.id, {
          action: 'updateLabel',
          text: '',
          enabled: false
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending disable message:', chrome.runtime.lastError);
          }
        });
        
        document.getElementById('toggleLabel').checked = false;
        updateStatus(false, '', 'default');
      });
    });
  });
});

document.getElementById('toggleLabel').addEventListener('change', function() {
  if (this.checked) {
    document.getElementById('enableBtn').click();
  } else {
    document.getElementById('disableBtn').click();
  }
});

// Brand Element Handlers
document.addEventListener('DOMContentLoaded', function() {
  const applyBrandBtn = document.getElementById('applyBrandBtn');
  const removeBrandBtn = document.getElementById('removeBrandBtn');
  const toggleBrand = document.getElementById('toggleBrand');
  const brandLogo = document.getElementById('brandLogo');
  
  if (applyBrandBtn) {
    applyBrandBtn.addEventListener('click', function() {
      const brandText = document.getElementById('brandText').value.trim();
      const brandStyle = document.getElementById('brandStyle').value;
      const brandType = document.querySelector('input[name="brandType"]:checked')?.value || 'text';
      const brandScope = document.querySelector('input[name="brandScope"]:checked')?.value || 'all';
      const brandEnabled = document.getElementById('toggleBrand').checked;
      
      let logoData = null;
      if (brandType === 'logo') {
        const logoPreview = document.querySelector('#logoPreview img');
        if (logoPreview) {
          logoData = logoPreview.src;
        }
      }
      
      if (!brandText && !logoData) {
        alert('Please enter brand text or select a logo image.');
        return;
      }
      
      const brandSettings = {
        text: brandText,
        style: brandStyle,
        type: brandType,
        scope: brandScope,
        enabled: brandEnabled,
        logoData: logoData
      };
      
      if (brandScope === 'all') {
        // Save as global brand setting and remove any tab-specific setting
        const tabBrandKey = `brandTab_${currentTabId}`;
        chrome.storage.local.remove([tabBrandKey], function() {
          chrome.storage.local.set({brandSettings: brandSettings}, function() {
            // Apply to all tabs
            chrome.tabs.query({}, function(tabs) {
              tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                  action: 'updateBrand',
                  brandSettings: brandSettings
                }).catch(() => {});
              });
            });
          });
        });
      } else {
        // Save as tab-specific brand setting and remove global setting
        chrome.storage.local.remove(['brandSettings'], function() {
          const tabBrandKey = `brandTab_${currentTabId}`;
          chrome.storage.local.set({[tabBrandKey]: brandSettings}, function() {
            chrome.tabs.sendMessage(currentTabId, {
              action: 'updateBrand',
              brandSettings: brandSettings
            }).catch(() => {});
          });
        });
      }
    });
  }

  if (removeBrandBtn) {
    removeBrandBtn.addEventListener('click', function() {
      const brandScope = document.querySelector('input[name="brandScope"]:checked')?.value || 'all';
      
      if (brandScope === 'all') {
        // Remove global brand and clear from all tabs
        chrome.storage.local.remove(['brandSettings'], function() {
          chrome.tabs.query({}, function(tabs) {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, {
                action: 'updateBrand',
                brandSettings: { enabled: false }
              }).catch(() => {});
            });
          });
        });
      } else {
        // Remove tab-specific brand only
        const tabBrandKey = `brandTab_${currentTabId}`;
        chrome.storage.local.remove([tabBrandKey], function() {
          chrome.tabs.sendMessage(currentTabId, {
            action: 'updateBrand',
            brandSettings: { enabled: false }
          }).catch(() => {});
        });
      }
      
      // Clear form fields
      document.getElementById('toggleBrand').checked = false;
      document.getElementById('brandText').value = '';
      document.getElementById('brandStyle').value = 'default';
      document.querySelector('input[name="brandType"][value="text"]').checked = true;
      document.querySelector('input[name="brandScope"][value="all"]').checked = true;
      toggleBrandType('text');
      
      const preview = document.getElementById('logoPreview');
      if (preview) {
        preview.innerHTML = '<span class="empty">No logo selected</span>';
        preview.classList.add('empty');
      }
    });
  }

  if (toggleBrand) {
    toggleBrand.addEventListener('change', function() {
      if (this.checked) {
        applyBrandBtn.click();
      } else {
        removeBrandBtn.click();
      }
    });
  }

  // Brand type toggle
  document.querySelectorAll('input[name="brandType"]').forEach(radio => {
    radio.addEventListener('change', function() {
      toggleBrandType(this.value);
    });
  });

  // Logo file handler
  if (brandLogo) {
    brandLogo.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          displayLogoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

// Utility functions
function toggleBrandType(type) {
  const textGroup = document.getElementById('brandTextGroup');
  const logoGroup = document.getElementById('brandLogoGroup');
  
  if (textGroup && logoGroup) {
    if (type === 'text') {
      textGroup.style.display = 'block';
      logoGroup.style.display = 'none';
    } else {
      textGroup.style.display = 'none';
      logoGroup.style.display = 'block';
    }
  }
}

function displayLogoPreview(logoData) {
  const preview = document.getElementById('logoPreview');
  if (preview) {
    preview.innerHTML = `<img src="${logoData}" alt="Logo Preview">`;
    preview.classList.remove('empty');
  }
}

// Initialize logo preview as empty when page loads
document.addEventListener('DOMContentLoaded', function() {
  const preview = document.getElementById('logoPreview');
  if (preview && !preview.innerHTML.trim()) {
    preview.innerHTML = '<span class="empty">No logo selected</span>';
    preview.classList.add('empty');
  }
});

function updateStatus(enabled, text, style) {
  const statusEl = document.getElementById('status');
  if (enabled && text) {
    const styleNames = {
      'default': 'Default Gradient',
      'classic': 'Classic Black',
      'news': 'News Red',
      'corporate': 'Corporate Blue',
      'neon': 'Neon Green',
      'sports': 'Sports Orange',
      'elegant': 'Elegant Gold',
      'gaming': 'Gaming Purple',
      'minimal': 'Minimal White',
      'retro': 'Retro 80s',
      'glassy': 'Glassy Transparent',
      'dark': 'Dark Mode',
      'neon-pink': 'Neon Pink',
      'fire': 'Fire Orange',
      'ocean': 'Ocean Blue',
      'matrix': 'Matrix Green',
      'sunset': 'Sunset Orange'
    };
    statusEl.textContent = `✅ Label active: "${text}" (${styleNames[style] || 'Default'})`;
    statusEl.className = 'status active';
  } else {
    statusEl.textContent = '❌ No label active';
    statusEl.className = 'status inactive';
  }
}