// TODO: https://developer.chrome.com/extensions/messaging
// use long term connection

let activate = document.getElementById('activate');
let deactivate = document.getElementById('deactivate');
activate.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {activate: true}, function(response) {
      activate.classList.add("hidden")
      deactivate.classList.remove("hidden")
    });
  });
};

deactivate.onclick = function(element) {
  console.log(element)
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {activate: false}, function(response) {
      activate.classList.remove("hidden")
      deactivate.classList.add("hidden")
      console.log(response.deactivated);
    });
  });
};