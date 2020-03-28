var CATEGORY_SYMBOL = ''
var SYMBOLS = ''
var SUBJECT_SYMBOL = ''

chrome.storage.local.get(['categorySymbol, symbols, subjectSymbol'], (items) => {
  CATEGORY_SYMBOL = items['categorySumbol']
  SYMBOLS = items['symbols']
  SUBJECT_SYMBOL = items['subjectSymbol']
})

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

// return rows that match the course symbol and those after until the next course
const filterCourse = ( rows, course ) => {
  const matchedCourse = rows.filter(r => r.innerText.includes(course)).pop()
  const start = rows.indexOf(matchedCourse)
  const nextCourse = rows.slice(start+1).filter(r => r.innerText.includes(SUBJECT_SYMBOL)).shift()
  const end = rows.indexOf(nextCourse)
  return rows.slice(start, end)
}

export function main( categories, filterValues ) {
  let results = [...document.querySelectorAll('tr.operationboxf')]
  if ( categories.includes(optionNames[0]) ){
    // optionNames[0] = Course
    results = filterCourse(results, filterValues[0])
    filterValues.shift()
    categories.shift()
  }
  const conditionsDict = {}
  categories.forEach((category, i) => conditionsDict[category] = filterValues[i])
  // use for-loop to recursively filter results
  for ( const condition in conditionsDict ) {
    const columnIndex = optionNames.indexOf(condition)
    results = filterBy(results, columnIndex, conditionsDict[condition])
  }
  results = removeEmptyCategories(results)
  return results
}
