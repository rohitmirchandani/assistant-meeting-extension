function pollAndOpenPopup(){
  const isMeetingUrl = MeetingUrlRegexes[window.location.hostname]?.test(window.location.href);
  if(!isMeetingUrl) return;
  clearInterval(intervalId);
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('injected.html');
  iframe.style = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    height: 400px;
    z-index: 9999;
    border: none;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
    background: white;
  `;
  iframe.id = "agent-iframe";
  document.body.appendChild(iframe);
  
  
  iframe.onload = () => {
    iframe.contentWindow.postMessage({ pageUrl: transformUrl(window.location.href) }, '*');
  };   

  window.addEventListener('message', (event) => {
    handleWindowMessage(event); 
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "REFRESH_PAGE") {
      refreshIframe();
    }
  });
}

let intervalId = setInterval(pollAndOpenPopup, 1000);
console.log("Content TRIGGERED started", window.location.href);

////////////////LISTENERS///////////////////////

function handleWindowMessage(event){
  switch(event.data.type){
    case 'closeIframe':
      document.getElementById("agent-iframe")?.remove();
      break;
    case 'refreshIframe':
      refreshIframe();
      break;
    default:
      break;
  }
}


function refreshIframe() {
  const iframe = document.getElementById("agent-iframe");
  if (iframe) iframe.src = chrome.runtime.getURL('injected.html');
}

function transformUrl(url) {
  const urlObj = new URL(url);
  switch (urlObj.hostname) {
    case 'teams.live.com': {
      const newUrl = url.replace(/\/v2\/#\/([^?]+)\?[^#]*/, (match, path) => {
        const pMatch = match.match(/[?&]p=([^&#]*)/);
        return pMatch ? `/${path}?p=${pMatch[1]}` : `/${path}`;
      }).replace('/v2/', '/');
      return newUrl;
    }
    case 'teams.microsoft.com': {
      const [, path, query] = url.match(/https?:\/\/teams\.microsoft\.com\/v2\/\?meetingjoin=true#(\/l\/meetup-join\/19:[^/]+\/\d+)\?([^#]+)/);
      const [, context] = query.match(/context=([^&]+)/);
      const cleanUrl = `https://teams.microsoft.com${path}?context=${context}`;
      return cleanUrl;
    }
    default:
      return url;
  }
}

/////////////////////// VARIABLES ///////////////////////

MeetingUrlRegexes = {
  'zoom.us': /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/,
  'teams.live.com': /^https?:\/\/teams\.live\.com\/v2\/#\/meet\/\d+\?(.*&)?p=[A-Za-z0-9]+(&.*)?$/,
  'meet.google.com': /^https?:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?.*)?$/, 
  'teams.microsoft.com': /^https?:\/\/teams\.microsoft\.com\/v2\/\?meetingjoin=true#\/l\/meetup-join\/19:[A-Za-z0-9_@.]+\/\d+\?context=[^&]+(&[^#]*)?$/
}