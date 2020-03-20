const activate = document.querySelector('input');

activate.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {activate: activate.checked}, function(response) {
    });
  });
};