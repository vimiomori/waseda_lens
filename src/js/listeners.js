export function showOptions(event) {
  // Don't respond to menu items. Only respond to menu header.
  if (event.target.classList[0] !== "conditions-option") { return }
  Array.from(event.target.children[0].children).map(c => c.classList.toggle("hidden"))
}

export function selected(event){
  // When the same option is clicked consider it a deselect
  if ([...event.target.classList].includes('selected')) {
    event.target.classList.remove('selected')
  } else {
    // hide all other options
    [...event.target.parentElement.children].map(c => {
      if ([...c.classList].includes('selected')) {
        // hide previously selected option
        c.classList.remove('selected')
      }
      c.classList.toggle('hidden')
    })
    event.target.classList.add('selected')
  }
  (async () => {
    const src = chrome.extension.getURL('src/js/renderResults.js');
    return await import(src);
  })()
  .then(renderResults => renderResults.main())
  .catch(e => console.log(e))
}
