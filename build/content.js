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

// Listen for close message
window.addEventListener('message', (event) => {
  if (event.data.closeIframe) {
    document.getElementById("agent-iframe")?.remove();
  }
});

iframe.onload = () => {
  iframe.contentWindow.postMessage({ pageUrl: window.location.href }, '*');
};