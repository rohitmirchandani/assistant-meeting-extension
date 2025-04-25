let pageUrl = null;

const agentsDiv = document.getElementById('agents');
document.getElementById('close-btn')?.addEventListener('click', () => {
  window.parent.postMessage({ closeIframe: true }, '*');
});

window.addEventListener('message', (event) => {
  if (event.data.pageUrl) {
    pageUrl = event.data.pageUrl;
  }
});



async function setAgents(data) {
  if (!data?.proxy_auth_token) {
    throw new Error("Please login to <a href='https://chat.walkover.in/login' style='color: lightblue;'>50Agents</a>");
  }

  const response = await fetch(`https://routes.msg91.com/api/proxy/870623/36jowpr17/agent/meeting-agents?orgId=${data.selectedOrgId}`, {
    headers: {
      proxy_auth_token: data.proxy_auth_token,
      'Content-Type': 'application/json',
    }
  });

  const agents = await response.json();
  if(!agents.success){
    throw new Error(agents.message);
  }else if(!response.ok){
    console.log(agents);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  agentsDiv.innerHTML = '';
  agents.data.agents.forEach(agent => {
    const div = document.createElement('div');
    div.className = 'agent';
  
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 1rem;">
          ${agent.name.charAt(0).toUpperCase()}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 500; font-size: 1rem;">${agent.name}</div>
          <div style="font-size: 0.85rem; color: #aaa;">Click to assign</div>
        </div>
      </div>
    `;
  
    div.onclick = () => selectAgent(agent._id, data.selectedOrgId, data.proxy_auth_token);
    agentsDiv.appendChild(div);
  });  
}


// Step 2: Handle agent selection

async function selectAgent(agentId, orgId, token) {
  const headers = {
    'Content-Type': 'application/json',
    'Proxy_auth_Token': token
  };
  const body = {
    orgId: orgId,
    meetingUrl: pageUrl
  };
  try {
    const res = await fetch(`https://routes.msg91.com/api/proxy/870623/36jowpr17/meeting/add-agent/${agentId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    initiateClosePopup();
  } catch (err) {
    console.error('API call failed:', err);
    initiateClosePopup(err);
  }
}

async function initiateAgentSelection(){
  try{
    const data = await getFromStorage(['proxy_auth_token', 'selectedOrgId']);
    await setAgents(data);
  }catch(err){
    console.error('Error getting extension storage:', err);
    agentsDiv.innerHTML = `<p style = "color: red;">${err.message}</p>`;
  }
}

initiateAgentSelection().catch(err => {
  console.error('This is the injected script error', err)
});



async function getFromStorage(keys) {
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

function initiateClosePopup(err){
  agentsDiv.innerHTML = '<h3 style = "font-weight: 100">Your assistant will be here soon :)</h3>'
    setTimeout(() => {
      window.parent.postMessage({ closeIframe: true }, "*");
    }, 1000);
}