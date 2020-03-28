var SUBJECT_SYMBOL = ''
var CATEGORY_SYMBOL = ''
var SUBCATEGORY_SYMBOL = ''
var SYMBOLS = ''
var INSTRUCTION_MSG = ''
var NORES_MSG = ''

const keys = [
  'subjectSymbol',
  'categorySymbol',
  'subcategorySymbol',
  'symbols',
  'instructionMsg',
  'noResMsg'
]

const globalVars = [
  SUBJECT_SYMBOL,
  CATEGORY_SYMBOL,
  SUBCATEGORY_SYMBOL,
  SYMBOLS,
  INSTRUCTION_MSG,
  NORES_MSG
]

chrome.storage.local.get(keys, (items) => {
  keys.forEach((key, i) => {
    globalVars[i] = items[key]
  })
})

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

export function main() {
  // clear any existing results table
  const tableElement = document.querySelector('#lens #results')
  if ( tableElement.children.childElementCount !== 0 ) {
    tableElement.textContent = ''
  }
  const selectedElements = [...document.querySelectorAll('.selected')]
  if ( selectedElements.length === 0 ) {
    tableElement.insertAdjacentHTML('beforeend',
      `<tr><td>${INSTRUCTION_MSG}</td></tr>`
    )
    return
  }
  const selectedCategories = selectedElements.map(el => {
    return el.parentElement.parentElement.innerText.split('\n')[0]
  })
  const filterValues = selectedElements.map(el => el.innerText)

  (async () => {
    const src = chrome.extension.getURL('src/js/filter.js');
    return await import(src);
  })().then(filter => {
    const results = filter.main(selectedCategories, filterValues)
    if ( onlyCategoryNames(results) ) {
      // Display no results found error
      tableElement.insertAdjacentHTML('beforeend', `<tr><td>${NORES_MSG}</td></tr>`)
    } else {
      results.forEach(r => {
        constrowEl = r.cloneNode(true)
        rowEl.classList.remove('operationboxf')
        applyClass(rowEl)
        tableElement.insertAdjacentElement('beforeend', rowEl)
      })
      renderStats(tableElement, results)
    }
  }).catch(e => console.log(e))
}
