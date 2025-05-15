const types = {
  AUTO: 'auto', 
  NONE: 'none'
}

let pageUrl = null;
let selectedAgentId = null;
let orgId = null;
let token = null;
let timeout = setTimeout(() => {
  selectAgent(selectedAgentId);
}, 60000)

const agentsDiv = document.getElementById('agents');
document.getElementById('close-btn')?.addEventListener('click', closeWindow);

window.addEventListener('message', (event) => {
  if (event.data.pageUrl) {
    pageUrl = event.data.pageUrl;
  }
});

let focusedAgentIndex = 0;
let agentDivs = [];

async function setAgents(data) {
  if (!data?.proxy_auth_token) {
    const response = await chrome.runtime.sendMessage({ type: 'get-token' });
    if(response.token){
      await setInStorage('proxy_auth_token', response.token);
      data.proxy_auth_token = response.token;
    }else{
      if('token' in response){
        throw new Error("Please login to <a href='https://chat.50agents.com/login?autoclose=true' target='_blank' style='color: lightblue;'>50Agents</a>");
      }
      throw new Error(response.error);
    }
  }

  orgId = data.selectedOrgId;
  token = data.proxy_auth_token;

  const response = await fetch(`https://routes.msg91.com/api/proxy/870623/36jowpr17/agent/meeting-agents?orgId=${data.selectedOrgId || ''}`, {
    headers: {
      proxy_auth_token: data.proxy_auth_token,
      'Content-Type': 'application/json',
    }
  });

  const agentsData = await response.json();
  if (!agentsData.success) {
    if (response.status === 401) {
      await setInStorage('proxy_auth_token', null);
      agentsDiv.innerHTML = `
        <p style="color: red;">Session expired. Please reload or <a href='https://chat.50agents.com/login?autoclose=true' target='_blank' style='color: lightblue;'>login</a></p>
        <button id="refresh-btn" style="margin: 10px auto; cursor: pointer;">Reload</button>
      `;
      document.getElementById('refresh-btn')?.addEventListener('click', () => {
        refreshWindow();
      });
      return;
    }    
    throw new Error(agentsData.message);
  } else if (!response.ok) {
    console.log(agents);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  let agents = agentsData.data.agents;
  agents = [...agents, { _id: types.NONE, name: "Don't join Agent", icon: '🚫' }]
  if (agents.length > 2) {
    agents = [{ _id: types.AUTO, name: 'Auto select smartly', icon: '🪄' }, ...agents]
  }
  selectedAgentId = agents[0]._id;
  agentsDiv.innerHTML = '';
  agentDivs = [];
  agents.forEach((agent, idx) => {
    const div = document.createElement('div');
    div.className = 'agent' + (agent._id === selectedAgentId ? ' selected' : '');
    div.setAttribute('tabindex', '0');
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label', agent.name);
    const isType = Object.values(types).includes(agent._id);
    div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 1rem;">
              ${agent.icon || agent.name.charAt(0).toUpperCase()}
            </div>
          <div style="flex: 1;">
            <div style="font-weight: 500; font-size: 1rem;">${agent.name}</div>
            ${isType || agent._id === selectedAgentId ? '' : `<div style="font-size: 0.85rem; color: #aaa;">Click to assign</div>`}
          </div>
        </div>
      `;
    div.onclick = () => selectAgent(agent._id);
    div.onfocus = () => {
      focusedAgentIndex = idx;
      updateAgentFocus();
    };
    agentDivs.push(div);
    agentsDiv.appendChild(div);
  });
  if (agentDivs.length > 0) {
    setTimeout(() => agentDivs[0].focus(), 0);
    focusedAgentIndex = 0;
    updateAgentFocus();
  }
  const moreAgents = document.createElement('div');
  moreAgents.innerHTML = `<p class = "more-agents">Add more agents <a href="https://chat.50agents.com/${orgId}?configure-meeting-agents=true" target="_blank">here</a>.</p>`
  agentsDiv.appendChild(moreAgents);
}

function updateAgentFocus() {
  agentDivs.forEach((div, idx) => {
    if (idx === focusedAgentIndex) {
      div.classList.add('selected');
      div.focus();
    } else {
      div.classList.remove('selected');
    }
  });
}


async function selectAgent(agentId) {
  selectedAgentId = agentId;
  if(selectedAgentId == types.NONE){
    initiateClosePopup('Okay :)');
    return;
  }
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
    initiateClosePopup(err.message);
  }
}

async function initiateAgentSelection(){
  try{
    const data = await getFromStorage(['proxy_auth_token', 'selectedOrgId']);
    await setAgents(data);
  }catch(err){
    console.error('Error getting extension storage:', err);
    agentsDiv.innerHTML = `<p style = "color: red;">${err.message || 'Something Went Wrong!!!'}</p>`;
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

async function setInStorage(key, value) {
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

function initiateClosePopup(msg){
  agentsDiv.innerHTML = `<h3 style = "font-weight: 100">${msg || 'Your assistant will be here soon :)'}</h3>`
    setTimeout(() => {
      closeWindow();
    }, 1000);
}

function closeWindow(){
  window.parent.postMessage({ type: "closeIframe" }, "*");
}

function refreshWindow() {
  window.parent.postMessage({ type: "refreshIframe" }, "*");
}


document.addEventListener('keydown', (e) => {
  if (!agentDivs.length) return;
  if (document.activeElement && !agentDivs.includes(document.activeElement)) return;
  if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
    e.preventDefault();
  }
  if (e.key === 'ArrowDown') {
    focusedAgentIndex = (focusedAgentIndex + 1) % agentDivs.length;
    agentDivs[focusedAgentIndex].focus();
    updateAgentFocus();
  } else if (e.key === 'ArrowUp') {
    focusedAgentIndex = (focusedAgentIndex - 1 + agentDivs.length) % agentDivs.length;
    agentDivs[focusedAgentIndex].focus();
    updateAgentFocus();
  } else if (e.key === 'Enter') {
    agentDivs[focusedAgentIndex].click();
  } else if (e.key === 'Escape') {
    closeWindow();
  }
});