var SUBJECT_SYMBOL = ''
var TERMS = ''

chrome.storage.local.get(['subjectSymbol', 'terms'], (items) => {
  SUBJECT_SYMBOL = items['subjectSymbol']
  TERMS = items['terms']
})

const optionNames = [...document.querySelectorAll('th')].map(title => title.innerText)

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

const options = [courseOptions, yearOptions, termOptions, creditOptions, gradeOptions, gradepointOptions]

export function main(){
  const optionsDict = {}
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
