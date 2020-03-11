'use strict'

const JAPANESE = document.querySelector('title').innerText.replace('\n', '') === '成績照会' ? true : false
const COURSE_SYMBOL = JAPANESE ? '◎' : ''
const TERMS = JAPANESE ? ["春", "秋"] : ["Spring", "Fall"]
const NORES_MSG = JAPANESE ? '該当する項目はありませんでした！' : 'Found no matches!'

var makeOptions = (options) => {
  var all = JAPANESE ? '全て' : 'All'
  return `
    <td>
      <select class="condition">
        <option selected="selected"> ${all} </option>
        ${options.map(o => `<option value=${o}> ${o} </option>`).join('')}
      </select>
    </td>
  `
}

var optionNames = () => {
  return `
    ${[...document.querySelectorAll('th')].map(n => `<th>${n.innerText}</th>`).join('')}
  `
}

var yearOptions = () => {
  var yearCol = [...document.querySelectorAll('tr.operationboxf  td:nth-child(2)')]
  var years = new Set(yearCol.filter((e) => !(e.innerText === "\n")).map((e) => e.innerText))
  return makeOptions([...years])
}

var courseOptions = () => {
  var courses = new Set(
    [...document.querySelectorAll('tr.operationboxf  td:nth-child(1)')]
    .filter((e) => e.innerText.includes(COURSE_SYMBOL))
    .map((e) => e.innerText.replace('\n', ''))
  )
  return makeOptions([...courses])
}

var termOptions = () => makeOptions(TERMS)

var creditOptions = () => makeOptions(["2", "1"])

var gradeOptions = () => makeOptions(["A", "B", "C", "D", "F", "G", "H", "P"])

var gradepointOptions = () => makeOptions(["4", "3", "2", "1", "0"])

document.querySelector('form[name="FRM_DETAIL"] table').insertAdjacentHTML('afterend',`
    <div id="lens">
      <table>
        <tr>
        ${optionNames()}
        </tr>
        <tr id="filter">
        ${courseOptions()}
        ${yearOptions()}
        ${termOptions()}
        ${creditOptions()}
        ${gradeOptions()}
        ${gradepointOptions()}
        </tr>
      </table>
      <table id="results" width="100%">
      </table>
    </div>
`)

// return rows that match the course symbol and those after until the next course
var filterCourse = ( rows, course ) => {
  var matchedCourse = rows.filter(r => r.innerText.includes(course)).pop()
  var start = rows.indexOf(matchedCourse)
  var nextCourse = rows.slice(start+1).filter(r => r.innerText.includes(COURSE_SYMBOL)).shift()
  var end = rows.indexOf(nextCourse)
  return rows.slice(start, end)
}

// filter by the value of the nth-child 
var filterBy = ( rows, index, value ) => {
  rows.forEach(r => console.log([...r.children][index].innerText))
  console.log(value)
  return rows.filter(r => [...r.children][index].innerText.includes(value))
}

var filter = ( ...conditions ) => {
  console.log(conditions)
  var results = [...document.querySelectorAll('tr.operationboxf')]
  var skip = ["All", "全て"]
  var course = conditions[0]
  if ( !skip.includes(course) ){
    results = filterCourse(results, course)
  }
  // start at 1 to match index of columns
  for ( var i = 1; i < conditions.length; i++ ) {
    console.log(conditions[i])
    if ( skip.includes(conditions[i]) ) { continue }
    console.log(conditions)
    results = filterBy(results, i, conditions[i])
  }
  return results
}

var renderResults = () => {
  var resTable = document.querySelector('#lens #results')
  if ( resTable.children.childElementCount !== 0 ) {
    resTable.textContent = ''
  }
  var conditions = [...document.querySelectorAll('.condition')].map(f => f.value)
  var results = filter(...conditions)
  if ( results.length === 0 ) {
    alert(NORES_MSG)
  }
  results.forEach(r => {
      var rowEl = r.cloneNode(true)
      rowEl.classList.remove('operationboxf')
      resTable.insertAdjacentElement('beforeend', rowEl)
  })
}

document.querySelector('#filter').onchange = (e) => {
  renderResults()
}
