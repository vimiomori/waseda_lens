// TODO: https://developer.chrome.com/extensions/messaging
// use long term connection

let activate = document.querySelector('input');
activate.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {activate: activate.checked}, function(response) {
      // activate.classList.add("hidden")
      // deactivate.classList.remove("hidden")
    });
  });
};