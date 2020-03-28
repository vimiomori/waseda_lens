export const JAPANESE = /[u4e00-\u9fff]/.test(document.querySelector('title').innerText)
export const SUBJECT_SYMBOL = JAPANESE ? '◎' : '['
export const CATEGORY_SYMBOL = JAPANESE ? '【' : '{'
export const SUBCATEGORY_SYMBOL = JAPANESE ? '《' : '<'
export const SYMBOLS = [SUBJECT_SYMBOL, CATEGORY_SYMBOL, SUBCATEGORY_SYMBOL]
export const TERMS = JAPANESE ? ["春", "秋"] : ["spring", "fall"]
export const INSTRUCTION_MSG = JAPANESE ?
  'カテゴリー名をクリックしてフィルターの条件を選択してください。' :
  'Click a category to select conditions to filter by.'
export const NORES_MSG = JAPANESE ? '該当する項目はありませんでした！' : 'Found no matches!'