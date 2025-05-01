import { getFromStorage, setInStorage } from './utility.js'


async function setTokenFromCookie(){
    try{
        const token = await getTokenFromCookie('proxy_auth_token');
        await setInStorage('proxy_auth_token', token);
    }
    catch(e){
        console.error("Error getting token from local storage: ", e);
    }
}

async function getTokenFromCookie(){
    return new Promise((resolve, reject) => {
        chrome.cookies.get({
            url: "https://chat.50agents.com",
            name: "proxy_auth_token"
          }, function(cookie) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(cookie?.value);
            }
          });
    });
}

async function setToken(){
    if(!await getFromStorage('proxy_auth_token')){
        console.log("No token found in local storage");
        setTokenFromCookie();
    }
}


////////////////////**************LISTENERS**************////////////////////
  
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension Installed!!');
    setToken();
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(
      sender.tab
        ? "from a content script:" + sender.tab.url
        : "from the extension"
    );
  
    try {
      switch(request.type){
          case 'get-token' :
              getTokenFromCookie('proxy_auth_token').then((token) => {
                  sendResponse({ token });
              })
              break;
          case 'get-storage': 
              chrome.storage.local.get(request.keys, (result) => {
                  sendResponse(result); // result is already an object with key-value pairs
              });
              break;
          default: 
              sendResponse({ error: 'Invalid request' });
      }   
    } catch (e) {
      console.error("Error handling message:", e);
      sendResponse({ error: 'Internal error' });
    }
  
    return true;
  });