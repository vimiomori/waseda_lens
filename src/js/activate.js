const displayTable = () => {
  chrome.storage.local.get(['instructionMsg'], (msg) => {
    (async () => {
      const src = chrome.extension.getURL('src/js/createOptions.js');
      return await import(src);
    })().then(createOptions => { 
      document.querySelector('form[name="FRM_DETAIL"] table').insertAdjacentHTML('afterend',`
        <div id="lens">
          <div class="title"><i class="material-icons">photo_filter</i>Waseda Lens</div>
            <div class="conditions">
            ${createOptions.main()}
            </div>
          <table id="results">
          <tr><td>${msg}</td></tr>
          </table>
        </div>
      `)
    }).catch(e => console.log(e))
    (async () => {
      const src = chrome.extension.getURL('src/js/listeners.js');
      return await import(src);
    })().then(listener => {
      document.querySelectorAll('.conditions-option').forEach(option => {
        option.addEventListener("click", listener.showOptions)
      })
      document.querySelectorAll('.condition-option-options-select').forEach(selectOption => {
        selectOption.addEventListener("click", listener.selected)
      })
    }).catch(e => console.log(e))
  })
}

const addCDNs= () => {
  const iconCdn = '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>'
  const fontCdn = '<link href="https://fonts.googleapis.com/css?family=Baloo+Da+2&display=swap" rel="stylesheet"></link>'
  const cdns = [iconCdn, fontCdn]
  cdns.forEach( cdn => document.querySelector('head').insertAdjacentHTML('beforeend', cdn) )
}

export function main( on ) {
  console.log('activating')
  const status = document.querySelectorAll('form[name="FRM_TANI"] table')[1]
  const detail = document.querySelector('form[name="FRM_DETAIL"] table')
  if ( on ) {
    [status, detail].forEach(e => e.setAttribute("style", "display: none"))
    addCDNs()
    displayTable()
  } else {
    status.setAttribute("style", "display: inline-block")
    detail.setAttribute("style", "display: block")
    document.querySelector('#lens').remove()
  }
}
