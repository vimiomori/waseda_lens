const activate = document.querySelector('input');
activate.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var port = chrome.tabs.connect(tabs[0].id, {name: "activate"});
    // chrome.tabs.sendMessage(tabs[0].id, {activate: activate.checked}, function(response) {
    // });
  // });
  port.postMessage({activate: activate.checked})
  })
}