const activate = document.querySelector('input');
const connect = () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const port = chrome.tabs.connect(tabs[0].id, {name: "activate"});
    activate.onclick = () => {
      port.postMessage({activate: activate.checked})
    }
    port.onMessage.addListener((msg) => {
      if (msg.refreshed) {
        activate.checked = false;
      }
    })
    port.onDisconnect.addListener(() => {
      setTimeout(() => { connect(), 500 })
    })
    chrome.storage.local.get(['activated'], (state) => {
      activate.checked = state.activated
    })
  })
}

connect();