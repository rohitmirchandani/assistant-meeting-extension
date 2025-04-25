export const STORAGE = {
    selectedOrgId: 'selectedOrgId', 
    token: 'proxy_auth_token'
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
  
  