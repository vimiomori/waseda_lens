const activate = document.querySelector('input');
activate.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var port = chrome.tabs.connect(tabs[0].id, {name: "activate"});
    port.postMessage({activate: activate.checked})
  })
  chrome.storage.local.set({
    activated: activate.checked
  })
}
chrome.storage.local.get(['activated'], function(activated) {
  activate.checked = activated.activated
})