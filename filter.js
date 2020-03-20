'use strict'

var JAPANESE = document.querySelector('title').innerText.replace('\n', '') === '成績照会' ? true : false
var COURSE_SYMBOL = JAPANESE ? '◎' : '['
var TERMS = JAPANESE ? ["春", "秋"] : ["spring", "fall"]
var NORES_MSG = JAPANESE ? '該当する項目はありませんでした！' : 'Found no matches!'


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

var displayTable = () => {
  document.querySelector('form[name="FRM_DETAIL"] table').insertAdjacentHTML('afterend',`
      <div id="lens">
        <h1>Waseda Lens</h1>
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
        <table id="results">
        </table>
      </div>
  `)
}

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
  var skip = ["All", "全て"]
  var course = conditions[0]
  if ( !skip.includes(course) ){
    results = filterCourse(results, course)
  }
  // start at 1 to match index of columns
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

var renderResults = () => {
  document.querySelector('#filter').onchange = (e) => {
    var tableElement = document.querySelector('#lens #results')
    if ( tableElement.children.childElementCount !== 0 ) {
      tableElement.textContent = ''
    }
    var conditions = [...document.querySelectorAll('.condition')].map(f => f.value)
    var results = filter(...conditions)
    if ( results.length === 0 ) {
      alert(NORES_MSG)
    }
    results.forEach(r => {
      var rowEl = r.cloneNode(true)
      rowEl.classList.remove('operationboxf')
      tableElement.insertAdjacentElement('beforeend', rowEl)
    })
    renderStats(tableElement, results)
  }
}

var activate = ( on=true ) => {
  var status = document.querySelectorAll('form[name="FRM_TANI"] table')[1]
  var detail = document.querySelector('form[name="FRM_DETAIL"] table')
  if ( on ) {
    [status, detail].forEach(e => e.setAttribute("style", "display: none"))
    displayTable()
    renderResults()
  } else {
    status.setAttribute("style", "display: inline-block")
    detail.setAttribute("style", "display: block")
    document.querySelector('#lens').remove()
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    activate(request.activate)
  }
);
