'use strict'

var JAPANESE = document.querySelector('title').innerText.replace('\n', '') === '成績照会' ? true : false
var SUBJECT_SYMBOL = JAPANESE ? '◎' : '['
var CATEGORY_SYMBOL = JAPANESE ? '' : '{'
var SUBCATEGORY_SYMBOL = JAPANESE ? '' : '<'
var SYMBOLS = [SUBJECT_SYMBOL, CATEGORY_SYMBOL, SUBCATEGORY_SYMBOL]
var TERMS = JAPANESE ? ["春", "秋"] : ["spring", "fall"]
var NORES_MSG = JAPANESE ? '該当する項目はありませんでした！' : 'Found no matches!'


// return rows that match the course symbol and those after until the next course
var filterCourse = ( rows, course ) => {
  var matchedCourse = rows.filter(r => r.innerText.includes(course)).pop()
  var start = rows.indexOf(matchedCourse)
  var nextCourse = rows.slice(start+1).filter(r => r.innerText.includes(SUBJECT_SYMBOL)).shift()
  var end = rows.indexOf(nextCourse)
  return rows.slice(start, end)
}

// filter by the value of the nth-child 
var filterBy = ( rows, index, value ) => {
  return rows.filter(r => {
    var cellVal = [...r.children][index].innerText
    if (cellVal.includes(value) || cellVal === "\n") {
      return true
    } else {
      return false
    }
  })
}

var filter = ( ...conditions ) => {
  var results = [...document.querySelectorAll('tr.operationboxf')]
  var course = conditions[0]
  var skip = ["All", "全て"]
  if ( !skip.includes(course) ){
    results = filterCourse(results, course)
  }
  // start at 1 to skip filtering by course
  for ( var i = 1; i < conditions.length; i++ ) {
    if ( skip.includes(conditions[i]) ) { continue }
    results = filterBy(results, i, conditions[i])
  }
  
  return results
}

var renderStats = ( table, results ) => {
  var gradePoints = []
  for ( var i = 0; i < results.length; i++ ) {
    var val = parseInt([...results[i].children].pop().innerText)
    if ( isNaN(val) ) {
      continue
    } else {
      gradePoints.push(val)
    }
  }
  if (gradePoints.length === 0) { return }
  var gpa = gradePoints.reduce((a, c) => a + c) / gradePoints.length
  table.insertAdjacentHTML('beforeend', `
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>GPA: </td>
      <td>${gpa.toFixed(2)}</td>
    <tr>
  `)
}

// give rows class names for styling
var applyClass = (row) => {
  if (row.innerText.includes(SUBJECT_SYMBOL)) {
    row.classList.add('subject')
  } else if (row.innerText.includes(CATEGORY_SYMBOL)) {
    row.classList.add('category')
  } else if (row.innerText.includes(SUBCATEGORY_SYMBOL)) {
    row.classList.add('subcategory')
  } else {
    row.classList.add('course')
  }
}

// True if all rows are category rows
var onlyCategoryNames = (rows) => {
  var courseResults = rows.filter(row => {  // all rows that are not category rows
    return !(row.innerText.split('').some(c => SYMBOLS.includes(c)))
  })
  return courseResults.length === 0
}

var renderResults = () => {
  // clear any existing results table
  var tableElement = document.querySelector('#lens #results')
  if ( tableElement.children.childElementCount !== 0 ) {
    tableElement.textContent = ''
  }
  var conditions = [...document.querySelectorAll('.selected')]
                    .map(selected => selected.innerText)
  var results = filter(...conditions)
  if ( onlyCategoryNames(results)) {
    tableElement.insertAdjacentHTML('beforeend', `<tr><td>${NORES_MSG}</td></tr>`)
  } else {
    results.forEach(r => {
      var rowEl = r.cloneNode(true)
      rowEl.classList.remove('operationboxf')
      applyClass(rowEl)
      tableElement.insertAdjacentElement('beforeend', rowEl)
    })
    renderStats(tableElement, results)
  }
}

var makeOptions = (options, optionLabel) => {
  return `${options.map((o, i) => `
    <div class="condition-option-options-select hidden" id="${optionLabel}-${i}">
      ${o}
    </div>
  `).join('')}`
}

var yearOptions = () => {
  var yearCol = [...document.querySelectorAll('tr.operationboxf  td:nth-child(2)')]
  var years = new Set(yearCol.filter((e) => !(e.innerText === "\n")).map((e) => e.innerText))
  return makeOptions([...years], 'years')
}

var courseOptions = () => {
  var courses = new Set(
    [...document.querySelectorAll('tr.operationboxf  td:nth-child(1)')]
    .filter((e) => e.innerText.includes(SUBJECT_SYMBOL))
    .map((e) => e.innerText.replace('\n', ''))
  )
  return makeOptions([...courses], 'courses')
}

var termOptions = () => makeOptions(TERMS, 'terms')

var creditOptions = () => makeOptions(["2", "1"], 'credit')

var gradeOptions = () => makeOptions(["A", "B", "C", "D", "F", "G", "H", "P"], 'grade')

var gradepointOptions = () => makeOptions(["4", "3", "2", "1", "0"], 'gradepoint')

var optionNames = [...document.querySelectorAll('th')].map(title => title.innerText)

var options = [courseOptions, yearOptions, termOptions, creditOptions, gradeOptions, gradepointOptions]

var optionsDict = {}

var showOptions = (event) => {
  // Don't respond to menu items. Only respond to menu header.
  if (event.target.classList[0] !== "conditions-option") { return }
  Array.from(event.target.children[0].children).map(c => c.classList.toggle("hidden"))
}

var selected = (event) => {
  [...event.target.parentElement.children].map(c => {
    if ([...c.classList].includes('selected')) {
      c.classList.remove('selected') 
    }
    c.classList.toggle("hidden")
  })
  event.target.classList.add('selected')
  renderResults()
}

var createOptions = () => {
  optionNames.forEach((name, i) => optionsDict[name] = options[i])
  return `
    ${optionNames
      .map(n => `
        <div class="conditions-option">${n}
          <div class="condition-option-options">
            ${optionsDict[n]()}
          </div>
        </div>
      `)
      .join('')}
  `
}

var displayTable = () => {
  document.querySelector('form[name="FRM_DETAIL"] table').insertAdjacentHTML('afterend',`
    <div id="lens">
      <div class="title"><i class="material-icons">photo_filter</i>Waseda Lens</div>
        <div class="conditions">
        ${createOptions()}
        </div>
      <table id="results">
      </table>
    </div>
  `)
  document.querySelectorAll('.conditions-option').forEach(option => {
    option.addEventListener("click", showOptions)
  })
  document.querySelectorAll('.condition-option-options-select').forEach(selectOption => {
    selectOption.addEventListener("click", selected)
  })
}

var addCDNs= () => {
  const iconCdn = '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>'
  const fontCdn = '<link href="https://fonts.googleapis.com/css?family=Baloo+Da+2&display=swap" rel="stylesheet"></link>'
  const cdns = [iconCdn, fontCdn]
  cdns.forEach( cdn => document.querySelector('head').insertAdjacentHTML('beforeend', cdn) )
}

var activate = ( on=true ) => {
  var status = document.querySelectorAll('form[name="FRM_TANI"] table')[1]
  var detail = document.querySelector('form[name="FRM_DETAIL"] table')
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

var port = chrome.runtime.onConnect.addListener(function(port){
  console.assert(port.name === "activate")
  port.onMessage.addListener(function(msg) {
    activate(msg.activate)
  })
})
