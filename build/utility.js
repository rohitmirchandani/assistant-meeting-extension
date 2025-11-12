export const STORAGE = {
    selectedOrgId: 'selectedOrgId', 
    token: 'proxy_auth_token',
    rememberAgentSelection: 'rememberAgentSelection_'
}

export const CONSTANTS = {
  domain: 'https://chat.50agents.com'
}

export async function setInStorage(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function getFromStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(Array.isArray(keys) ? result : result[keys]);
      }
    });
  });
}

export async function removeFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}