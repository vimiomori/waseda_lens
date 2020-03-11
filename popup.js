let activate = document.getElementById('activate');
activate.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {file: 'filter.js'},
      () => {
        if ( chrome.runtime.lastError ) {
          console.error("Script injection failed: " + chrome.runtime.lastError.message);
        }
      }
    )
  });
};

let deactivate = document.getElementById('deactivate');
deactivate.onclick = function(element) {
  console.log(element)
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {deactivate: true}, function(response) {
      console.log(response.deactivated);
    });
  });
};