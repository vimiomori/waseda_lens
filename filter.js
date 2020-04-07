"use strict";

const JAPANESE = /[u4e00-\u9fff]/.test(
  document.querySelector("title").innerText
);
const SUBJECT_SYMBOL = JAPANESE ? "◎" : "[";
const CATEGORY_SYMBOL = JAPANESE ? "【" : "{";
const SUBCATEGORY_SYMBOL = JAPANESE ? "《" : "<";
const SYMBOLS = [SUBJECT_SYMBOL, CATEGORY_SYMBOL, SUBCATEGORY_SYMBOL];
const TERMS = JAPANESE ? ["春", "秋"] : ["spring", "fall"];
const INSTRUCTION_MSG = JAPANESE
  ? "カテゴリー名をクリックしてフィルターの条件を選択してください。"
  : "Click a category to select conditions to filter by.";
const NORES_MSG =
  JAPANESE ?
  "該当する項目はありませんでした！" :
  "Found no matches!";
const USER = document.querySelector('.welcome').innerText.match(/Welcomeback\s+(.+)/)[1];
const STATS_TITLE = 
  JAPANESE ?
  "の成績概略" :
  "'s stats";

const SELECTED_OPTIONS = {
  course: [],
  year: [],
  term: [],
  credit: [],
  grade: [],
  gradepoint: []
};


const renderStats = (results) => {
  const gradePoints = results
    .map(result => {
      // GP is the last td in a result row
      return parseInt([...result.children].pop().innerText);
    })
    .filter(v => !isNaN(v));

  if (gradePoints.length === 0) {
    return;
  }
  const gpa = gradePoints.reduce((a, c) => a + c) / gradePoints.length;
  document.querySelector('.stats').insertAdjacentHTML(
    "beforeend",
    `
    <div class="stats-gpa">GPA: ${gpa.toFixed(2)}</div>
    `
  );
};

const displayStats = () => {
  document.querySelector('#lens').insertAdjacentHTML(
    "beforeend",
    `
    <div class="stats">
      <div class="stats-title">${USER}${STATS_TITLE}</div>
    </div>
    `
  );
}

// give rows class names for styling and easier querying
const applyClass = rows => {
  rows.forEach(row => {
    if (row.children[1].innerText !== "\n"){   // year column has value
      row.classList.add("course");
    } else if (row.innerText.includes(SUBJECT_SYMBOL)) {
      row.classList.add("subject");
    } else if (row.innerText.includes(CATEGORY_SYMBOL)) {
      row.classList.add("category");
    } else if (row.innerText.includes(SUBCATEGORY_SYMBOL)) {
      row.classList.add("subcategory");
    }
  })
};

// True if all rows are category rows
const noCourses = rows => {
  rows.filter(row => [...row.classList].includes('course')).length === 0
};

const clearExistingResults = () => {
  const resultsTable = document.querySelector("#lens #results")
  if (resultsTable) { resultsTable.remove(); }
  const instructionMsg = document.querySelector('.message');
  if (instructionMsg) { instructionMsg.remove(); }
  const stats = document.querySelector('.stats-gpa');
  if (stats) { stats.remove(); }
} 

const renderResults = (clicked) => {
  clearExistingResults();
  const results = filter();
  const conditionEl = document.querySelector('.condition')
  if (!Object.values(SELECTED_OPTIONS)) {
    conditionEl.insertAdjacentHTML(
      "afterend",
      `<div class="message">${INSTRUCTION_MSG}</div>`
    );
  } else if (noCourses(results)) {
    // Display no results found error
    conditionEl.insertAdjacentHTML(
      "afterend",
      `<div class="message">${NORES_MSG}</div>`
    );
  } else {
    const resultsTable = document.createElement('table')
    resultsTable.id = "results"
    document.querySelector('.stats').insertAdjacentElement("beforebegin", resultsTable)
    results.forEach(r => {
      let rowEl = r.cloneNode(true);  // use shallow copy of original row
      rowEl.classList.remove("operationboxf");
      // rowEl.classList.add("results-item");
      resultsTable.insertAdjacentElement("beforeend", rowEl);
    });
    moveToStats(clicked);
    renderStats(results);
  }
};

const makeOptions = (options, optionLabel) => {
  return `${options
    .map(
      (o, i) => `
    <div class="condition-option-options-select hidden ${optionLabel}" id="${optionLabel}-${i}">
      ${o}
    </div>
  `
    )
    .join("")}`;
};

const courseOptions = () => {
  const courses = new Set(
    [...document.querySelectorAll("tr.operationboxf  td:nth-child(1)")]
      .filter(e => /[◎\[\]]/.test(e.innerText))
      .map(e => e.innerText.replace(/[\n◎\[\]]/g, ""))
  );
  return makeOptions([...courses], "course");
};

const yearOptions = () => {
  const yearCol = [
    ...document.querySelectorAll("tr.operationboxf  td:nth-child(2)")
  ];
  const years = new Set(
    yearCol.filter(e => !(e.innerText === "\n")).map(e => e.innerText)
  );
  return makeOptions([...years], "year");
};

const termOptions = () => makeOptions(TERMS, "term");

const creditOptions = () => makeOptions(["2", "1"], "credit");

const gradeOptions = () =>
  makeOptions(["A", "B", "C", "D", "F", "G", "H", "P"], "grade");

const gradepointOptions = () =>
  makeOptions(["4", "3", "2", "1", "0"], "gradepoint");

const optionNames = [...document.querySelectorAll("th")].map(
  title => title.innerText
);

const options = [
  courseOptions,
  yearOptions,
  termOptions,
  creditOptions,
  gradeOptions,
  gradepointOptions
];

const optionsDict = {};

const filter = () => {
  let results = [...document.querySelectorAll("tr.operationboxf")];
  applyClass(results)

  if (SELECTED_OPTIONS.course) {
    const courseResults = []
    SELECTED_OPTIONS.course.forEach(course => {
      courseResults.push(...filterCourse(results, course));
    })
    results = courseResults
  }

  let index = 1;
  for (const option in SELECTED_OPTIONS) {
    if (option === "course") { continue; }
    else if (SELECTED_OPTIONS[option].length === 0) {
      index++;
      continue;
    } else {
      const optionResults = []
      SELECTED_OPTIONS[option].forEach(option => {
        optionResults.push(...filterBy(results, index, option));
      })
      results = optionResults
      index++;
    }
  }
  results = removeEmptyCategories(results);
  return results;
};

// return rows that match the course symbol and those after until the next course
const filterCourse = (rows, course) => {
  const matchedCourse = rows.filter(r => r.innerText.includes(course)).pop();
  const start = rows.indexOf(matchedCourse);
  const nextCourse = rows
    .slice(start + 1)
    .filter(r => [...r.classList].includes('subject')).shift();
  const end = rows.indexOf(nextCourse);
  return rows.slice(start, end);
};

const removeEmptyCategories = rows => {
  const firstCategory = rows
    .filter(r => [...r.classList].includes('category'))
    .shift();
  const start = rows.indexOf(firstCategory);
  const nextCategory = rows
    .slice(start + 1)
    .filter(r => [...r.classList].includes('category'))
    .shift();
  if (!nextCategory) {
    return rows;
  }
  const end = rows.indexOf(nextCategory);
  const courses = rows
    .slice(start, end)
    .filter(r => [...r.classList].includes('course'));
  if (!courses.length) {
    rows.splice(start, end - start); // remove rows with no courses
    return removeEmptyCategories(rows); // continue with remaining rows
  } else {
    const checked = rows.splice(0, end);
    return [...checked, ...removeEmptyCategories(rows)];
  }
};

// filter by the value of the nth-child
const filterBy = (rows, index, value) => {
  return rows.filter(r => {
    const cellVal = [...r.children][index].innerText;
    if (cellVal.includes(value) || cellVal === "\n") {
      return true;
    } else {
      return false;
    }
  });
};

const showOptions = event => {
  // Don't respond to menu items. Only respond to menu header.
  if (event.target.classList[0] !== "condition-option-title") {
    return;
  }
  [
    ...event.target.parentElement.querySelectorAll(
      ".condition-option-options-select"
    )
  ].forEach(el => {
    el.classList.toggle("hidden");
  });
};

const selected = event => {
  const selectedType = [...event.target.classList].filter((cls) => {
    return Object.keys(SELECTED_OPTIONS).includes(cls);
  }).pop();
  SELECTED_OPTIONS[selectedType].push(event.target.innerText);
    // hide all other options
  [...event.target.parentElement.children].map(c => {
    c.classList.toggle("hidden");
  });
  renderResults(event.target);
};

const moveToStats = (oldSelected) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  const newSelected = oldSelected.cloneNode(true)
  const movingSelected = oldSelected.cloneNode(true)
  movingSelected.classList.remove('selected')
  newSelected.classList.remove('selected')
  movingSelected.classList.remove('hidden')
  newSelected.classList.remove('hidden')
  movingSelected.classList.add('moving')

  const statsElement = document.querySelector('.stats')
  statsElement.appendChild(newSelected)

  const oldOffset = oldSelected.getBoundingClientRect()
  movingSelected.style.top = oldOffset.top
  movingSelected.style.left = oldOffset.left
  movingSelected.style.width = oldOffset.right - oldOffset.left - 20 // padding
  document.querySelector('body').appendChild(movingSelected)
  
  const newOffset = newSelected.getBoundingClientRect()
  const transX = newOffset.left - oldOffset.left
  const transY = newOffset.top - oldOffset.top
  // newSelected.style.display = 'none'
  movingSelected.animate(
    [
      {transform: 'translateX(0px) translateY(0px)'},
      {transform: `translateX(${transX}px) translateY(${transY}px)`}
    ],
    {
      duration: 300,
      easing: 'cubic-bezier(0, 0, 0.3, 1)'
    }
  )
}

const getOffset = (element) => {
  let top = 0, left = 0;
  do {
      top += element.offsetTop  || 0;
      left += element.offsetLeft || 0;
      element = element.offsetParent;
  } while(element);

  return {
      top: top,
      left: left
  };
};

const createOptions = () => {
  optionNames.forEach((name, i) => (optionsDict[name] = options[i]));
  return `
    ${optionNames
      .map(
        name =>
      `
        <div class="condition-option">
          <div class="condition-option-title">${name}</div>
          <div class="condition-option-options${name === optionNames[0] ? " fat" : ""}">${optionsDict[name]()}</div>
        </div>
      `
      )
      .join("")}
  `;
};

const displayLens = () => {
  document.querySelector('form[name="FRM_DETAIL"] table').insertAdjacentHTML(
    "afterend",
    `
    <div id="lens">
      <div class="title"><i class="material-icons">photo_filter</i>Waseda Lens</div>
      <div class="condition">${createOptions()}</div>
      <div class="message">${INSTRUCTION_MSG}</div>
    </div>
  `
  );
  document.querySelectorAll(".condition-option").forEach(option => {
    option.addEventListener("click", showOptions);
  });
  document.querySelectorAll(".condition-option-options-select").forEach(selectOption => {
    selectOption.addEventListener("click", selected);
  });
};

const addCDNs = () => {
  const iconCdn =
    '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>';
  const fontCdn =
    '<link href="https://fonts.googleapis.com/css?family=Baloo+Da+2&display=swap" rel="stylesheet"></link>';
  const cdns = [iconCdn, fontCdn];
  cdns.forEach(cdn =>
    document.querySelector("head").insertAdjacentHTML("beforeend", cdn)
  );
};

const activate = on => {
  const banner = document.querySelectorAll('.basecolor')
  const status = document.querySelectorAll('form[name="FRM_TANI"] table');
  const detail = document.querySelector('form[name="FRM_DETAIL"] table');
  if (on) {
    addCDNs();
    displayLens();
    displayStats();
    [detail, ...status, ...banner].forEach(e => e.classList.add("hidden"));
    document.querySelector(".operationboxt").closest("table").classList.add("original-table")
  } else {
    [detail, ...status, ...banner].forEach(e => e.classList.remove("hidden"));
    document.querySelector("#lens").remove();
    document.querySelector(".operationboxt").closest("table").classList.remove("original-table")
  }
};

chrome.runtime.onConnect.addListener((port) => {
  // console.assert(port.name === "activate");
  port.onMessage.addListener((msg) => {
    chrome.storage.local.set({
      activated: msg.activate
    })
    activate(msg.activate);
  });
  window.addEventListener('beforeunload', () => {
    chrome.storage.local.set({
      activated: false
    })
    port.postMessage({refreshed: true})
  })
});
