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

chrome.storage.local.set(
  {
    japanese: JAPANESE,
    subjectSymbol: SUBJECT_SYMBOL,
    categorySymbol: CATEGORY_SYMBOL,
    subcategorySymbol: SUBCATEGORY_SYMBOL,
    symbols: SYMBOLS,
    terms: TERMS,
    instructionMsg: INSTRUCTION_MSG,
    noResMsg: NORES_MSG
  }
)

const port = chrome.runtime.onConnect.addListener(function(port){
  port.onMessage.addListener(function(msg) {
    (async () => {
      const src = chrome.extension.getURL('src/js/activate.js');
      const activate= await import(src);
      activate.main(msg.activate)
    })();
  })
})
