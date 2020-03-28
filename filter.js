'use strict'

const JAPANESE = /[u4e00-\u9fff]/.test(document.querySelector('title').innerText)
const SUBJECT_SYMBOL = JAPANESE ? '◎' : '['
const CATEGORY_SYMBOL = JAPANESE ? '【' : '{'
const SUBCATEGORY_SYMBOL = JAPANESE ? '《' : '<'
const SYMBOLS = [SUBJECT_SYMBOL, CATEGORY_SYMBOL, SUBCATEGORY_SYMBOL]
const TERMS = JAPANESE ? ["春", "秋"] : ["spring", "fall"]
const INSTRUCTION_MSG = JAPANESE ?
  'カテゴリー名をクリックしてフィルターの条件を選択してください。' :
  'Click a category to select conditions to filter by.'
const NORES_MSG = JAPANESE ? '該当する項目はありませんでした！' : 'Found no matches!'


const renderStats = ( table, results ) => {
  const gradePoints = results.map(result => {
    // GP is the last td in a result row
    return parseInt([...result.children].pop().innerText)
  }).filter(v => !isNaN(v))

  if (gradePoints.length === 0) { return }
  const gpa = gradePoints.reduce((a, c) => a + c) / gradePoints.length
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
const applyClass = (row) => {
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
const onlyCategoryNames = (rows) => {
  const courseResults = rows.filter(row => {  // all rows that are not category rows
    return !(row.innerText.split('').some(c => SYMBOLS.includes(c)))
  })
  return courseResults.length === 0
}

const renderResults = () => {
  // clear any existing results table
  const tableElement = document.querySelector('#lens #results')
  if ( tableElement.children.childElementCount !== 0 ) {
    tableElement.textContent = ''
  }
  const selectedElements = [...document.querySelectorAll('.selected')]
  const selectedCategories = selectedElements.map(el => {
    return el.parentElement.parentElement.innerText.split('\n')[0]
  })
  const filterValues = selectedElements.map(el => el.innerText)
  const results = filter(selectedCategories, filterValues)
  if ( selectedElements.length === 0 ) {
    tableElement.insertAdjacentHTML('beforeend',
      `<tr><td>${INSTRUCTION_MSG}</td></tr>`
    )
  } else if ( onlyCategoryNames(results) ) {
    // Display no results found error
    tableElement.insertAdjacentHTML('beforeend', `<tr><td>${NORES_MSG}</td></tr>`)
  } else {
    results.forEach(r => {
      let rowEl = r.cloneNode(true)
      rowEl.classList.remove('operationboxf')
      applyClass(rowEl)
      tableElement.insertAdjacentElement('beforeend', rowEl)
    })
    renderStats(tableElement, results)
  }
}

const makeOptions = (options, optionLabel) => {
  return `${options.map((o, i) => `
    <div class="condition-option-options-select hidden" id="${optionLabel}-${i}">
      ${o}
    </div>
  `).join('')}`
}

const courseOptions = () => {
  const courses = new Set(
    [...document.querySelectorAll('tr.operationboxf  td:nth-child(1)')]
    .filter((e) => e.innerText.includes(SUBJECT_SYMBOL))
    .map((e) => e.innerText.replace('\n', ''))
  )
  return makeOptions([...courses], 'courses')
}

const yearOptions = () => {
  const yearCol = [...document.querySelectorAll('tr.operationboxf  td:nth-child(2)')]
  const years = new Set(yearCol.filter((e) => !(e.innerText === "\n")).map((e) => e.innerText))
  return makeOptions([...years], 'years')
}

const termOptions = () => makeOptions(TERMS, 'terms')

const creditOptions = () => makeOptions(["2", "1"], 'credit')

const gradeOptions = () => makeOptions(["A", "B", "C", "D", "F", "G", "H", "P"], 'grade')

const gradepointOptions = () => makeOptions(["4", "3", "2", "1", "0"], 'gradepoint')

const optionNames = [...document.querySelectorAll('th')].map(title => title.innerText)

const options = [courseOptions, yearOptions, termOptions, creditOptions, gradeOptions, gradepointOptions]

const optionsDict = {}

const filter = ( categories, filterValues ) => {
  let results = [...document.querySelectorAll('tr.operationboxf')]
  if ( categories.includes(optionNames[0]) ){
    // optionNames[0] = Course
    results = filterCourse(results, filterValues[0])
    filterValues.shift()
    categories.shift()
  }
  const conditionsDict = {}
  categories.map((category, i) => conditionsDict[category] = filterValues[i])
  // use for-loop to recursively filter results
  for ( const condition in conditionsDict ) {
    const columnIndex = optionNames.indexOf(condition)
    results = filterBy(results, columnIndex, conditionsDict[condition])
  }
  results = removeEmptyCategories(results)
  return results
}

// return rows that match the course symbol and those after until the next course
const filterCourse = ( rows, course ) => {
  const matchedCourse = rows.filter(r => r.innerText.includes(course)).pop()
  const start = rows.indexOf(matchedCourse)
  const nextCourse = rows.slice(start+1).filter(r => r.innerText.includes(SUBJECT_SYMBOL)).shift()
  const end = rows.indexOf(nextCourse)
  return rows.slice(start, end)
}

const removeEmptyCategories = ( rows ) => {
  const firstCategory = rows.filter(r => r.innerText.includes(CATEGORY_SYMBOL)).shift()
  const start = rows.indexOf(firstCategory)
  const nextCategory = rows.slice(start+1).filter(r => r.innerText.includes(CATEGORY_SYMBOL)).shift()
  if (!nextCategory) { return rows }
  const end = rows.indexOf(nextCategory)
  // Get all rows that don't have a SYMBOL
  const courses = rows.slice(start, end).filter(r => !SYMBOLS.some(s => r.innerText.includes(s)))
  if (!courses.length) {
    rows.splice(start, end - start) // remove rows with no courses
    return removeEmptyCategories(rows) // continue with remaining rows
  } else {
    const checked = rows.splice(0, end)
    return [...checked, ...removeEmptyCategories(rows)]
  }
}

// filter by the value of the nth-child 
const filterBy = ( rows, index, value ) => {
  return rows.filter(r => {
    const cellVal = [...r.children][index].innerText
    if (cellVal.includes(value) || cellVal === "\n") {
      return true
    } else {
      return false
    }
  })
}


const showOptions = (event) => {
  // Don't respond to menu items. Only respond to menu header.
  if (event.target.classList[0] !== "conditions-option") { return }
  Array.from(event.target.children[0].children).map(c => c.classList.toggle("hidden"))
}

const selected = (event) => {
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
  renderResults()
}

const createOptions = () => {
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

const displayTable = () => {
  document.querySelector('form[name="FRM_DETAIL"] table').insertAdjacentHTML('afterend',`
    <div id="lens">
      <div class="title"><i class="material-icons">photo_filter</i>Waseda Lens</div>
        <div class="conditions">
        ${createOptions()}
        </div>
      <table id="results">
      <tr><td>${INSTRUCTION_MSG}</td></tr>
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

const addCDNs= () => {
  const iconCdn = '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>'
  const fontCdn = '<link href="https://fonts.googleapis.com/css?family=Baloo+Da+2&display=swap" rel="stylesheet"></link>'
  const cdns = [iconCdn, fontCdn]
  cdns.forEach( cdn => document.querySelector('head').insertAdjacentHTML('beforeend', cdn) )
}

const activate = ( on ) => {
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

const port = chrome.runtime.onConnect.addListener(function(port){
  console.assert(port.name === "activate")
  port.onMessage.addListener(function(msg) {
    activate(msg.activate)
  })
})
